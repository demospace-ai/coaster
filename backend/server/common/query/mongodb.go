package query

import (
	"context"
	"encoding/json"
	"fmt"

	"go.fabra.io/server/common/data"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const MONGO_TIMESTAMP_TZ_FORMAT = "2006-01-02T15:04:05.000+07:00"

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
	Database   string              `json:"database"`
	Collection string              `json:"collection"`
	Filter     bson.D              `json:"filter"`
	Options    options.FindOptions `json:"options"`
}

// must be pointer receiver to increment field
func (it *MongoDbIterator) Next() (data.Row, error) {
	if it.currentIndex < len(it.mongoDbRows) {
		row := convertMongoDbRow(it.mongoDbRows[it.currentIndex].(bson.D), it.schema)
		it.currentIndex++
		return row, nil
	}

	return nil, data.ErrDone
}

func (it *MongoDbIterator) Schema() data.Schema {
	return it.schema
}

func (mc MongoDbApiClient) openConnection(ctx context.Context) (*mongo.Client, error) {
	connectionString := fmt.Sprintf(
		"mongodb+srv://%s:%s@%s/?%s",
		mc.Username,
		mc.Password,
		mc.Host,
		mc.ConnectionOptions,
	)
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		ApplyURI(connectionString).
		SetServerAPIOptions(serverAPIOptions)
	return mongo.Connect(ctx, clientOptions)
}

func (mc MongoDbApiClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
	client, err := mc.openConnection(ctx)
	if err != nil {
		return nil, err
	}

	defer client.Disconnect(ctx)

	db := client.Database(namespace)
	return db.ListCollectionNames(ctx, bson.D{})
}

func (mc MongoDbApiClient) GetSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
	client, err := mc.openConnection(ctx)
	if err != nil {
		return nil, err
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

func (mc MongoDbApiClient) GetFieldValues(ctx context.Context, namespace string, tableName string, fieldName string) ([]any, error) {
	// TODO
	return nil, nil
}

func (mc MongoDbApiClient) GetNamespaces(ctx context.Context) ([]string, error) {
	client, err := mc.openConnection(ctx)
	if err != nil {
		return nil, err
	}

	defer client.Disconnect(ctx)

	databaseNames, err := client.ListDatabaseNames(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	return databaseNames, nil
}

func (mc MongoDbApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
	client, err := mc.openConnection(ctx)
	if err != nil {
		return nil, err
	}
	defer client.Disconnect(ctx)

	var mongoQuery MongoQuery
	err = json.Unmarshal([]byte(queryString), &mongoQuery)
	if err != nil {
		return nil, err
	}

	schemaC := make(chan data.Schema)
	errC := make(chan error)
	go func() {
		schema, err := mc.GetSchema(ctx, mongoQuery.Database, mongoQuery.Collection)
		schemaC <- schema
		errC <- err

		close(schemaC)
		close(errC)
	}()

	db := client.Database(mongoQuery.Database)
	collection := db.Collection(mongoQuery.Collection)
	cursor, err := collection.Find(
		ctx,
		mongoQuery.Filter,
		&mongoQuery.Options,
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var rows bson.A
	err = cursor.All(ctx, &rows)
	if err != nil {
		return nil, err
	}

	schema := <-schemaC
	err = <-errC
	if err != nil {
		return nil, err
	}

	return &data.QueryResults{
		Schema: schema,
		Data:   convertMongoDbRows(rows, schema),
	}, nil
}

func (mc MongoDbApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	client, err := mc.openConnection(ctx)
	if err != nil {
		return nil, err
	}
	defer client.Disconnect(ctx)

	var mongoQuery MongoQuery
	err = json.Unmarshal([]byte(queryString), &mongoQuery)
	if err != nil {
		return nil, err
	}

	schemaC := make(chan data.Schema)
	errC := make(chan error)
	go func() {
		schema, err := mc.GetSchema(ctx, mongoQuery.Database, mongoQuery.Collection)
		schemaC <- schema
		errC <- err

		close(schemaC)
		close(errC)
	}()

	db := client.Database(mongoQuery.Database)
	collection := db.Collection(mongoQuery.Collection)
	cursor, err := collection.Find(
		ctx,
		mongoQuery.Filter,
		&mongoQuery.Options,
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var rows bson.A
	err = cursor.All(ctx, &rows)
	if err != nil {
		return nil, err
	}

	schema := <-schemaC
	err = <-errC
	if err != nil {
		return nil, err
	}

	return &MongoDbIterator{
		schema:       schema,
		currentIndex: 0,
		mongoDbRows:  rows,
	}, nil
}

func getFields(collection *mongo.Collection) ([]string, error) {
	ctx := context.TODO()
	cursor, err := collection.Aggregate(
		ctx,
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

	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	var fields []string
	for _, field := range results[0]["fields"].(bson.A) {
		fields = append(fields, field.(string))
	}

	return fields, nil
}

func getFieldTypes(collection *mongo.Collection, fields []string) (map[string]string, error) {
	ctx := context.TODO()
	fieldTypes := make(map[string]string)
	for _, field := range fields {
		cursor, err := collection.Aggregate(
			ctx,
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

		defer cursor.Close(ctx)

		var typesForField []string
		for cursor.Next(ctx) {
			var result bson.M
			err = cursor.Decode(&result)
			if err != nil {
				return nil, err
			}

			// Even if most of the fields are missing/null, we use the most common non-null type if one exists
			fieldType := result["_id"].(bson.M)["fieldType"]
			if fieldType == "missing" || fieldType == "null" {
				continue
			}

			typesForField = append(typesForField, fieldType.(string))
		}

		// If there are truly no types, then the field type is null
		if len(typesForField) == 0 {
			typesForField = append(typesForField, "null")
		}

		if err = cursor.Err(); err != nil {
			return nil, err
		}

		fieldTypes[field] = typesForField[0]
	}

	return fieldTypes, nil
}

func convertMongoDbRows(mongoDbRows bson.A, schema data.Schema) []data.Row {
	var rows []data.Row
	for _, mongoDbRow := range mongoDbRows {
		rows = append(rows, convertMongoDbRow(mongoDbRow.(bson.D), schema))
	}

	return rows
}

func convertMongoDbRow(mongoDbRow bson.D, schema data.Schema) data.Row {
	// TODO: convert the values to the expected Fabra Golang types
	valueMap := make(map[string]any)
	for _, keyPair := range mongoDbRow {
		valueMap[keyPair.Key] = keyPair.Value
	}

	// make sure every result is in the same order by looping through schema
	row := make(data.Row, len(mongoDbRow))
	for i, field := range schema {
		value := convertMongoDbValue(valueMap[field.Name], field.Type)
		row[i] = value
	}

	return row
}

func convertMongoDbValue(mongoDbValue any, fieldType data.FieldType) any {
	if mongoDbValue == nil {
		return nil
	}

	switch fieldType {
	case data.FieldTypeDateTimeTz:
		return mongoDbValue.(primitive.DateTime).Time().UTC().Format(FABRA_TIMESTAMP_TZ_FORMAT)
	case data.FieldTypeJson:
		return ToMap(mongoDbValue.(bson.D))
	case data.FieldTypeArray:
		return ToArray(mongoDbValue.(bson.A))
	default:
		return mongoDbValue
	}
}

func convertMongoDbSchema(fieldTypes map[string]string) data.Schema {
	var schema data.Schema
	for fieldName, fieldType := range fieldTypes {
		schema = append(schema, data.Field{
			Name: fieldName,
			Type: getMongoDbFieldType(fieldType),
		})
	}

	return schema
}

func getMongoDbFieldType(mongoDbType string) data.FieldType {
	switch mongoDbType {
	case "int", "int32", "long":
		return data.FieldTypeInteger
	case "date", "datetime":
		// MongoDB dates/datetimes are in UTC
		return data.FieldTypeDateTimeTz
	case "timestamp":
		return data.FieldTypeTimestamp
	case "decimal", "double", "float64":
		return data.FieldTypeNumber
	case "array":
		return data.FieldTypeArray
	case "object":
		return data.FieldTypeJson
	case "bool":
		return data.FieldTypeBoolean
	default:
		return data.FieldTypeString
	}
}

func ToMap(bsonMap bson.D) map[string]any {
	output := map[string]any{}
	for _, pair := range bsonMap {
		if pair.Value == nil {
			continue
		}

		switch value := pair.Value.(type) {
		case bson.D:
			output[pair.Key] = ToMap(value)
		case bson.A:
			output[pair.Key] = ToArray(value)
		default:
			output[pair.Key] = value
		}
	}
	return output
}

func ToArray(bsonArray bson.A) []any {
	output := []any{}
	for _, rawValue := range bsonArray {
		switch value := rawValue.(type) {
		case bson.D:
			output = append(output, ToMap(value))
		case bson.A:
			output = append(output, ToArray(value))
		default:
			output = append(output, value)
		}
	}

	return output
}
