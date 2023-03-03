package query

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"

	"go.fabra.io/server/common/data"
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
	schema       data.Schema
}

type MongoQuery struct {
	Database string `json:"database"`
	Query    bson.D `json:"query"`
}

// must be pointer receiver to increment field
func (it *MongoDbIterator) Next() (data.Row, error) {
	if it.currentIndex < len(it.mongoDbRows) {
		row := convertMongoDbRow(it.mongoDbRows[it.currentIndex].(bson.M), it.schema)
		it.currentIndex++
		return row, nil
	}

	return nil, data.ErrDone
}

func (it *MongoDbIterator) Schema() data.Schema {
	return it.schema
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

func (sc MongoDbApiClient) GetTableSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
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

func (sc MongoDbApiClient) GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]data.Value, error) {
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

func (sc MongoDbApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
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
	schema := getMongoSchemaFromRow(rows[0].(bson.M))

	return &data.QueryResults{
		Schema: schema,
		Data:   convertMongoDbRows(rows, schema),
	}, nil
}

func (sc MongoDbApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
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
	schema := getMongoSchemaFromRow(rows[0].(bson.M))

	return &MongoDbIterator{
		schema:       schema,
		currentIndex: 0,
		mongoDbRows:  rows,
	}, nil
}

func convertMongoDbRows(mongoDbRows bson.A, schema data.Schema) []data.Row {
	var rows []data.Row
	for _, mongoDbRow := range mongoDbRows {
		rows = append(rows, convertMongoDbRow(mongoDbRow.(bson.M), schema))
	}

	return rows
}

func convertMongoDbRow(mongoDbRow bson.M, schema data.Schema) data.Row {
	var row data.Row
	// make sure every result is in the same order by looping through schema
	for _, columnName := range schema {
		mongoDbValue := mongoDbRow[columnName.Name]
		row = append(row, data.Value(mongoDbValue))
	}

	return row
}

func convertMongoDbSchema(fieldTypes map[string]string) data.Schema {
	var schema data.Schema
	for fieldName, fieldType := range fieldTypes {
		schema = append(schema, data.ColumnSchema{
			Name: fieldName,
			Type: getMongoDbColumnType(fieldType),
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

func getMongoSchemaFromRow(firstRow bson.M) data.Schema {
	schema := data.Schema{}
	for key, value := range firstRow {
		mongoDbType := reflect.TypeOf(value).String()
		switch mongoDbType {
		case "primitive.DateTime":
			mongoDbType = "datetime"
		case "primitive.Timestamp":
			mongoDbType = "timestamp"
		case "primitive.A":
			mongoDbType = "array"
		case "primitive.M":
			mongoDbType = "object"
		case "primitive.Decimal128":
			mongoDbType = "decimal"
		}

		columnSchema := data.ColumnSchema{
			Name: key,
			Type: getMongoDbColumnType(mongoDbType),
		}

		schema = append(schema, columnSchema)
	}

	return schema
}

func getMongoDbColumnType(mongoDbType string) data.ColumnType {
	switch mongoDbType {
	case "int", "int32", "long":
		return data.ColumnTypeInteger
	case "date":
		return data.ColumnTypeDate
	case "datetime":
		return data.ColumnTypeDateTime
	case "decimal", "double", "float64":
		return data.ColumnTypeNumber
	case "timestamp":
		return data.ColumnTypeTimestampNtz
	case "array":
		return data.ColumnTypeArray
	case "object":
		return data.ColumnTypeJson
	case "bool":
		return data.ColumnTypeBoolean
	default:
		return data.ColumnTypeString
	}
}
