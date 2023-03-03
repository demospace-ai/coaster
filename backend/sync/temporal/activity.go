package temporal

import (
	"context"
	"fmt"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/destinations"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/repositories/syncs"
	"go.temporal.io/sdk/activity"
)

type ReplicateInput struct {
	OrganizationID int64
	SyncID         int64
}

func Replicate(ctx context.Context, input ReplicateInput) error {
	logger := activity.GetLogger(ctx)

	db, err := database.InitDatabase()
	if err != nil {
		return err
	}

	queryService := query.NewQueryService(db, crypto.NewCryptoService())

	sync, err := syncs.LoadSyncByID(db, input.OrganizationID, input.SyncID)
	if err != nil {
		return err
	}

	source, err := sources.LoadSourceByID(db, input.OrganizationID, sync.EndCustomerId, sync.SourceID)
	if err != nil {
		return err
	}

	sourceConnection, err := connections.LoadConnectionByID(db, input.OrganizationID, source.ConnectionID)
	if err != nil {
		return err
	}

	object, err := objects.LoadObjectByID(db, input.OrganizationID, sync.ObjectID)
	if err != nil {
		return err
	}

	destination, err := destinations.LoadDestinationByID(db, input.OrganizationID, object.DestinationID)
	if err != nil {
		return err
	}

	destinationConnection, err := connections.LoadConnectionByID(db, input.OrganizationID, destination.ConnectionID)
	if err != nil {
		return err
	}

	fieldMappings, err := syncs.LoadFieldMappingsForSync(db, input.OrganizationID, input.SyncID)
	if err != nil {
		return err
	}

	objectFields, err := objects.LoadObjectFieldsByID(db, object.ID)
	if err != nil {
		return err
	}

	queryString := getQueryStringForSource(sourceConnection, sync)

	it, err := queryService.GetQueryIterator(ctx, sourceConnection, queryString)
	if err != nil {
		return err
	}

	sourceSchema := it.Schema()
	destinationSchema, err := queryService.GetTableSchema(ctx, destinationConnection, object.Namespace, object.TableName)
	if err != nil {
		return err
	}

	rowFormat, err := createRowFormat(sourceSchema, destinationSchema, objectFields, fieldMappings)
	if err != nil {
		return err
	}

	// TODO: batch insert 10,000 rows at a time
	// write to temporary table in destination
	for {
		row, err := it.Next()
		if err == data.ErrDone {
			break
		}

		if err != nil {
			return err
		}
		// TODO
		value := fmt.Sprintf(rowFormat, row)
		logger.Info("original row", row)
		logger.Info("converted row", value)

	}

	// copy from temporary table into dest table
	// delete all old data, then insert new data

	// delete temporary table

	logger.Info("replicate activity done")

	return nil
}

// TODO: only read 10,000 rows at once or something
func getQueryStringForSource(sourceConnection *models.Connection, sync *models.Sync) string {
	if sourceConnection == nil {
		return "" // TODO: throw error
	}

	if sync.CustomJoin.Valid {
		return sync.CustomJoin.String
	}

	switch sourceConnection.ConnectionType {
	case (models.ConnectionTypeBigQuery):
		fallthrough
	case (models.ConnectionTypeSnowflake):
		return "SELECT * FROM " + sync.Namespace.String + "." + sync.TableName.String + ";"
	}

	return ""
}

func getTempInsertStringForModel(object *models.Object, destination *models.DestinationConnection) string {
	if object == nil || destination == nil {
		return "" // TODO: throw error
	}

	switch destination.ConnectionType {
	case (models.ConnectionTypeBigQuery):
		fallthrough
	case (models.ConnectionTypeSnowflake):
		return "INSERT INTO " + getTempTableName(object.Namespace, object.TableName) + " SELECT * FROM VALUES\n"
	}

	return ""
}

func getTempTableName(namespace string, tableName string) string {
	return namespace + ".tmp_" + tableName
}

func getInsertStringForModel(object *models.Object, destination *models.DestinationConnection) string {
	if object == nil || destination == nil {
		return "" // TODO: throw error
	}

	switch destination.ConnectionType {
	case (models.ConnectionTypeBigQuery):
		fallthrough
	case (models.ConnectionTypeSnowflake):
		return "INSERT INTO " + object.Namespace + "." + object.TableName + " SELECT * FROM VALUES\n"
	}

	return ""
}

// TODO: this is only for bigquery, snowflake needs to do parse_json
func createRowFormat(sourceSchema data.Schema, destinationSchema data.Schema, objectFields []models.ObjectField, fieldMappings []models.FieldMapping) (string, error) {
	orderedObjectFields, err := createOrderedObjectFields(destinationSchema, objectFields)
	if err != nil {
		return "", err
	}

	destIdToSourceName := make(map[int64]string)
	for _, fieldMapping := range fieldMappings {
		destIdToSourceName[fieldMapping.DestinationFieldId] = fieldMapping.SourceFieldName
	}

	sourceNameToPosition := make(map[string]int)
	for i, sourceColumn := range sourceSchema {
		sourceNameToPosition[sourceColumn.Name] = i
	}

	rowFormat := "("
	for _, objectField := range orderedObjectFields {
		pos, err := getSourceColumnPosition(objectField, sourceNameToPosition, destIdToSourceName)
		if err != nil {
			return "", err
		}

		// TODO: assert source type matches/is compatible with dest type
		switch objectField.Type {
		case data.ColumnTypeString:
			rowFormat += fmt.Sprintf("'%%[%d]v' ", pos) // this adds a string of the format: '%[2]v'
		case data.ColumnTypeJson:
			rowFormat += fmt.Sprintf("JSON '%%[%d]v' ", pos) // this adds a string of the format: JSON '%[2]v'
		default:
			rowFormat += fmt.Sprintf("%%[%d]v ", pos) // this adds a string of the format: %[2]v
		}
	}
	rowFormat += ")"

	return rowFormat, nil
}

func getSourceColumnPosition(orderedObjectField models.ObjectField, sourceNameToPosition map[string]int, destIdToSourceName map[int64]string) (int, error) {
	sourceName, ok := destIdToSourceName[orderedObjectField.ID]
	if !ok {
		return -1, fmt.Errorf("could not find object field %d in field mappings: %v", orderedObjectField.ID, destIdToSourceName)
	}

	sourcePos, ok := sourceNameToPosition[sourceName]
	if !ok {
		return -1, fmt.Errorf("could not find source name %s in source schema: %v", sourceName, sourceNameToPosition)
	}

	return sourcePos, nil
}

func createOrderedObjectFields(destinationSchema data.Schema, objectFields []models.ObjectField) ([]models.ObjectField, error) {
	var orderedObjectFields []models.ObjectField
	for _, column := range destinationSchema {
		objectField, err := getObjectField(column.Name, objectFields)
		if err != nil {
			return nil, err
		}

		if !objectField.Omit {
			orderedObjectFields = append(orderedObjectFields, *objectField)
		}
	}

	return orderedObjectFields, nil
}

func getObjectField(columnName string, objectFields []models.ObjectField) (*models.ObjectField, error) {
	for _, objectField := range objectFields {
		if objectField.Name == columnName {
			return &objectField, nil
		}
	}

	return nil, fmt.Errorf("did not find column name %s in object fields: %+v", columnName, objectFields)
}
