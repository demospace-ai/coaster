package query

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDbApiClient struct {
	Username          string
	Password          string
	Host              string
	ConnectionOptions string
}

type MongoDbIterator struct {
	mongoDbRows  bson.A
	currentIndex int
	schema       Schema
}

type MongoQuery struct {
	Database string `json:"database"`
	Query    bson.D `json:"query"`
}

func (it *MongoDbIterator) Next() (Row, error) {
	if it.currentIndex < len(it.mongoDbRows) {
		row := convertMongoDbRow(it.mongoDbRows[it.currentIndex].(bson.M), it.schema)
		it.currentIndex = it.currentIndex + 1
		return row, nil
	}

	return nil, ErrDone
}

func (sc MongoDbApiClient) openConnection(ctx context.Context) (*mongo.Client, error) {
	connectionString := fmt.Sprintf(
		"mongodb+srv://%s:%s@%s/?%s",
		sc.Username,
		sc.Password,
		sc.Host,
		sc.ConnectionOptions,
	)
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		ApplyURI(connectionString).
		SetServerAPIOptions(serverAPIOptions)
	return mongo.Connect(ctx, clientOptions)
}

func (sc MongoDbApiClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Disconnect(ctx)

	db := client.Database(namespace)
	return db.ListCollectionNames(ctx, bson.D{})
}

func (sc MongoDbApiClient) GetTableSchema(ctx context.Context, namespace string, tableName string) (Schema, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Disconnect(ctx)

	db := client.Database(namespace)
	collection := db.Collection(tableName)
	fields, err := getFields(collection)
	if err != nil {
		return nil, err
	}

	fieldTypes, err := getFieldTypes(collection, fields)
	if err != nil {
		return nil, err
	}

	return convertMongoDbSchema(fieldTypes), nil
}

func (sc MongoDbApiClient) GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]Value, error) {
	// TODO
	return nil, nil
}

func (sc MongoDbApiClient) GetNamespaces(ctx context.Context) ([]string, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Disconnect(ctx)

	databaseNames, err := client.ListDatabaseNames(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	return databaseNames, nil
}

func (sc MongoDbApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*QueryResults, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}
	defer client.Disconnect(ctx)

	var mongoQuery MongoQuery
	err = json.Unmarshal([]byte(queryString), &mongoQuery)
	if err != nil {
		return nil, err
	}

	db := client.Database(mongoQuery.Database)

	var result bson.M
	db.RunCommand(
		ctx,
		mongoQuery.Query,
	).Decode(&result)

	rows := result["cursor"].(bson.M)["firstBatch"].(bson.A)
	schema := getMongoSchema(rows[0].(bson.M))

	return &QueryResults{
		Schema: schema,
		Data:   convertMongoDbRows(rows, schema),
	}, nil
}

func (sc MongoDbApiClient) GetQueryIterator(ctx context.Context, queryString string) (RowIterator, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}
	defer client.Disconnect(ctx)

	var mongoQuery MongoQuery
	err = json.Unmarshal([]byte(queryString), &mongoQuery)
	if err != nil {
		return nil, err
	}

	db := client.Database(mongoQuery.Database)

	var result bson.M
	db.RunCommand(
		ctx,
		mongoQuery.Query,
	).Decode(&result)

	rows := result["cursor"].(bson.M)["firstBatch"].(bson.A)
	schema := getMongoSchema(rows[0].(bson.M))

	return &MongoDbIterator{
		schema:       schema,
		currentIndex: 0,
		mongoDbRows:  rows,
	}, nil
}

func convertMongoDbRows(mongoDbRows bson.A, schema Schema) []Row {
	var rows []Row
	for _, mongoDbRow := range mongoDbRows {
		rows = append(rows, convertMongoDbRow(mongoDbRow.(bson.M), schema))
	}

	return rows
}

func convertMongoDbRow(mongoDbRow bson.M, schema Schema) Row {
	var row Row
	// make sure every result is in the same order by looping through schema
	for _, columnName := range schema {
		mongoDbValue := mongoDbRow[columnName.Name]
		row = append(row, Value(mongoDbValue))
	}

	return row
}

func convertMongoDbSchema(fieldTypes map[string]string) Schema {
	var schema Schema
	for fieldName, fieldType := range fieldTypes {
		schema = append(schema, ColumnSchema{
			Name: fieldName,
			Type: fieldType,
		})
	}

	return schema
}

func getFields(collection *mongo.Collection) ([]string, error) {
	cursor, err := collection.Aggregate(
		context.TODO(),
		mongo.Pipeline{
			bson.D{{Key: "$limit", Value: 10000}},
			bson.D{{Key: "$project", Value: bson.D{
				{Key: "data", Value: bson.D{
					{Key: "$objectToArray", Value: "$$ROOT"},
				}},
			}}},
			bson.D{{Key: "$unwind", Value: "$data"}},
			bson.D{{Key: "$group", Value: bson.D{
				{Key: "_id", Value: 0},
				{Key: "fields", Value: bson.D{
					{Key: "$addToSet", Value: "$data.k"},
				}},
			}}},
		},
	)
	if err != nil {
		return nil, err
	}

	var results []bson.M
	if err = cursor.All(context.TODO(), &results); err != nil {
		return nil, err
	}

	var fields []string
	for _, field := range results[0]["fields"].(bson.A) {
		fields = append(fields, field.(string))
	}

	return fields, nil
}

func getFieldTypes(collection *mongo.Collection, fields []string) (map[string]string, error) {
	fieldTypes := make(map[string]string)
	for _, field := range fields {
		cursor, err := collection.Aggregate(
			context.TODO(),
			mongo.Pipeline{
				bson.D{{Key: "$limit", Value: 10000}},
				bson.D{{Key: "$project", Value: bson.D{
					{Key: "_id", Value: 0},
					{Key: "fieldType", Value: bson.D{
						{Key: "$type", Value: "$" + field},
					}},
				}}},
				bson.D{{Key: "$group", Value: bson.D{
					{Key: "_id", Value: bson.D{
						{Key: "fieldType", Value: "$fieldType"},
					}},
					{Key: "count", Value: bson.D{
						{Key: "$sum", Value: "1"},
					}},
				}}},
			},
		)
		if err != nil {
			return nil, err
		}

		var results []bson.M
		if err = cursor.All(context.TODO(), &results); err != nil {
			return nil, err
		}

		fieldTypes[field] = results[0]["_id"].(bson.M)["fieldType"].(string)
	}

	return fieldTypes, nil
}

func getMongoSchema(firstRow bson.M) Schema {
	schema := Schema{}
	for key, value := range firstRow {
		fieldType := reflect.TypeOf(value).String()
		fmt.Print(fieldType)
		switch fieldType {
		case "primitive.A":
			fieldType = "array"
		case "primitive.M":
			fieldType = "json"
		case "primitive.ObjectID":
			fieldType = "objectID"
		}

		columnSchema := ColumnSchema{
			Name: key,
			Type: fieldType,
		}

		schema = append(schema, columnSchema)
	}

	return schema
}
