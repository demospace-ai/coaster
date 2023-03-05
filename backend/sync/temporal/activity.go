package temporal

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

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

	fieldMappings, err := syncs.LoadFieldMappingsForSync(db, input.SyncID)
	if err != nil {
		return err
	}

	objectFields, err := objects.LoadObjectFieldsByID(db, object.ID)
	if err != nil {
		return err
	}

	readQuery := getReadQuery(sourceConnection, sync, fieldMappings)

	it, err := queryService.GetQueryIterator(ctx, sourceConnection, readQuery)
	if err != nil {
		return err
	}

	columnString := createColumnString(objectFields, object.EndCustomerIdColumn)
	rowFormat, err := createRowFormat(objectFields, fieldMappings)
	if err != nil {
		return err
	}

	// TODO: batch insert 10,000 rows at a time
	// write to temporary table in destination
	rowStrings := []string{}
	for {
		row, err := it.Next()
		if err == data.ErrDone {
			break
		}

		if err != nil {
			return err
		}

		l := []any(row)
		l = append(l, sync.EndCustomerId) // add the end customer ID as well

		rowString := fmt.Sprintf(rowFormat, l...)
		rowStrings = append(rowStrings, rowString)
	}

	insertQuery := getInsertQuery(object, columnString, strings.Join(rowStrings, ", "))

	_, err = queryService.RunQuery(ctx, destinationConnection, insertQuery)
	if err != nil {
		return err
	}

	// TODO
	// copy from temporary table into dest table
	// delete all old data, then insert new data
	// delete temporary table

	logger.Info("replicate activity done")

	return nil
}

// TODO: only read 10,000 rows at once or something
func getReadQuery(sourceConnection *models.Connection, sync *models.Sync, fieldMappings []models.FieldMapping) string {
	if sourceConnection == nil || sync == nil || fieldMappings == nil {
		return "" // TODO: throw error
	}

	if sync.CustomJoin.Valid {
		return sync.CustomJoin.String
	}

	selectString := getSelectString(fieldMappings)
	return fmt.Sprintf("SELECT %s FROM %s.%s;", selectString, sync.Namespace.String, sync.TableName.String)
}

func getSelectString(fieldMappings []models.FieldMapping) string {
	columns := []string{}
	for _, fieldMapping := range fieldMappings {
		switch fieldMapping.SourceFieldType {
		case data.ColumnTypeTimestampNtz, data.ColumnTypeTimestampTz:
			// Golang formats timestamps differently, so just read them as a string
			columns = append(columns, fmt.Sprintf("STRING(%s)", fieldMapping.SourceFieldName))
		default:
			columns = append(columns, fieldMapping.SourceFieldName)
		}
	}

	return strings.Join(columns, ", ")
}

func getInsertQuery(object *models.Object, columnString string, valuesString string) string {
	if object == nil {
		return "" // TODO: throw error
	}

	return fmt.Sprintf("INSERT %s.%s %s VALUES %s;", object.Namespace, object.TableName, columnString, valuesString)
}

func createColumnString(objectFields []models.ObjectField, endCustomerIdColumn string) string {
	columns := []string{}
	for _, objectField := range objectFields {
		if objectField.Omit {
			continue
		}
		columns = append(columns, objectField.Name)
	}
	columns = append(columns, endCustomerIdColumn)

	return fmt.Sprintf("(%s)", strings.Join(columns, ", "))
}

// TODO: this is only for bigquery, snowflake needs to do parse_json
func createRowFormat(objectFields []models.ObjectField, fieldMappings []models.FieldMapping) (string, error) {
	destIdToSourcePosition := make(map[int64]int)
	for i, fieldMapping := range fieldMappings {
		destIdToSourcePosition[fieldMapping.DestinationFieldId] = i
	}

	tokens := []string{}
	for _, objectField := range objectFields {
		if objectField.Omit {
			continue
		}

		pos, err := getSourceColumnPosition(objectField, destIdToSourcePosition)
		if err != nil {
			return "", err
		}

		fmtPos := pos + 1 // format strings index the args from 1 not 0

		// TODO: assert source type matches/is compatible with dest type
		switch objectField.Type {
		case data.ColumnTypeInteger, data.ColumnTypeNumber:
			tokens = append(tokens, fmt.Sprintf("%%[%d]v", fmtPos)) // this adds a string of the format: %[2]v,
		case data.ColumnTypeJson:
			tokens = append(tokens, fmt.Sprintf("JSON '%%[%d]v'", fmtPos)) // this adds a string of the format: JSON '%[2]v',
		case data.ColumnTypeTimestampTz, data.ColumnTypeTimestampNtz:
			tokens = append(tokens, fmt.Sprintf("TIMESTAMP('%%[%d]v')", fmtPos)) // this adds a string of the format: JSON '%[2]v',
		case data.ColumnTypeDate:
			tokens = append(tokens, fmt.Sprintf("DATE(TIMESTAMP('%%[%d]v'))", fmtPos)) // this adds a string of the format: JSON '%[2]v',
		case data.ColumnTypeTime:
			tokens = append(tokens, fmt.Sprintf("TIME(TIMESTAMP('%%[%d]v'))", fmtPos)) // this adds a string of the format: JSON '%[2]v',
		default:
			tokens = append(tokens, fmt.Sprintf("'%%[%d]v'", fmtPos)) // this adds a string of the format: '%[2]v',
		}
	}

	// add one extra token for the end customer ID
	tokens = append(tokens, fmt.Sprintf("%%[%d]v", len(fieldMappings)+1))

	rowFormat := fmt.Sprintf("(%s)", strings.Join(tokens, ", "))
	return rowFormat, nil
}

func getSourceColumnPosition(orderedObjectField models.ObjectField, destIdToSourcePosition map[int64]int) (int, error) {
	sourcePosition, ok := destIdToSourcePosition[orderedObjectField.ID]
	if !ok {
		prettyMap, _ := json.Marshal(destIdToSourcePosition)
		return -1, fmt.Errorf("could not find object field %d in field mappings: %+v", orderedObjectField.ID, prettyMap)
	}

	return sourcePosition, nil
}
