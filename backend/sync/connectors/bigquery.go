package connectors

import (
	"context"
	"fmt"
	"strings"

	"cloud.google.com/go/bigquery"
	"github.com/google/uuid"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/views"
)

type BigQueryImpl struct {
	queryService query.QueryService
}

func NewBigQueryConnector(queryService query.QueryService) Connector {
	return BigQueryImpl{
		queryService: queryService,
	}
}

func (bq BigQueryImpl) Read(ctx context.Context, sourceConnection views.FullConnection, sync views.Sync, fieldMappings []views.FieldMapping) ([]data.Row, *string, error) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := bq.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		return nil, nil, err
	}
	sourceClient := sc.(query.BigQueryApiClient)

	readQuery := bq.getReadQuery(connectionModel, sync, fieldMappings)

	results, err := sourceClient.RunQuery(ctx, readQuery)
	if err != nil {
		return nil, nil, errors.NewCustomerVisibleError(err)
	}

	newCursorPosition := bq.getNewCursorPosition(results, sync)
	return results.Data, newCursorPosition, nil
}

// TODO: only read 10,000 rows at once or something
func (bq BigQueryImpl) getReadQuery(sourceConnection *models.Connection, sync views.Sync, fieldMappings []views.FieldMapping) string {
	var queryString string
	if sync.CustomJoin != nil {
		queryString = *sync.CustomJoin
	} else {
		selectString := bq.getSelectString(fieldMappings)
		queryString = fmt.Sprintf("SELECT %s FROM %s.%s", selectString, *sync.Namespace, *sync.TableName)
	}

	if sync.SyncMode.UsesCursor() {
		if sync.CursorPosition != nil {
			// TODO: allow choosing other operators (rows smaller than current cursor)
			// order by cursor field to simplify
			return fmt.Sprintf("%s WHERE %s > '%s' ORDER BY %s ASC;", queryString, *sync.SourceCursorField, *sync.CursorPosition, *sync.SourceCursorField)
		} else {
			return fmt.Sprintf("%s ORDER BY %s ASC;", queryString, *sync.SourceCursorField)
		}
	} else {
		return fmt.Sprintf("%s;", queryString)
	}
}

func (bq BigQueryImpl) getSelectString(fieldMappings []views.FieldMapping) string {
	fields := []string{}
	for _, fieldMapping := range fieldMappings {
		fields = append(fields, fieldMapping.SourceFieldName)
	}

	return strings.Join(fields, ",")
}

func (bq BigQueryImpl) getNewCursorPosition(results *data.QueryResults, sync views.Sync) *string {
	if sync.SourceCursorField == nil {
		return nil
	}

	if len(results.Data) <= 0 {
		return nil
	}

	var cursorFieldPos int
	for i := range results.Schema {
		if results.Schema[i].Name == *sync.SourceCursorField {
			cursorFieldPos = i
		}
	}

	// TODO: make sure we don't miss any rows
	// we sort rows by cursor field so just take the last row
	newCursorPos := results.Data[len(results.Data)-1][cursorFieldPos].(string)
	return &newCursorPos
}

func (bq BigQueryImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rows []data.Row,
) error {
	connectionModel := views.ConvertConnectionView(destinationConnection)

	dc, err := bq.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		return err
	}
	destClient := dc.(query.BigQueryApiClient)

	// TODO: batch insert 10,000 rows at a time
	// write to temporary table in destination
	rowStrings := []string{}
	for _, row := range rows {
		var rowTokens []string
		for i, value := range row {
			sourceType := fieldMappings[i].SourceFieldType
			if value == nil {
				// empty string for null values will be interpreted as null when loading from csv
				rowTokens = append(rowTokens, "")
			} else {
				switch sourceType {
				case data.FieldTypeJson:
					// JSON-like values need to be escaped according to BigQuery expectations. Even if the destination
					// type is not JSON, it is necessary to escape to avoid issues
					// https://cloud.google.com/bigquery/docs/reference/standard-sql/json-data#load_from_csv_files
					escapedValue := fmt.Sprintf("\"%s\"", strings.ReplaceAll(fmt.Sprintf("%v", value), "\"", "\"\""))
					rowTokens = append(rowTokens, escapedValue)
				case data.FieldTypeString:
					// escape the string so commas don't break the CSV schema
					rowTokens = append(rowTokens, fmt.Sprintf("\"%v\"", value))
				default:
					rowTokens = append(rowTokens, fmt.Sprintf("%v", value))
				}
			}
		}

		rowTokens = append(rowTokens, fmt.Sprintf("%d", sync.EndCustomerID))
		rowString := strings.Join(rowTokens, ",")
		rowStrings = append(rowStrings, rowString)
	}

	file := uuid.New().String()
	gcsReference := fmt.Sprintf("gs://%s/%s", destinationOptions.StagingBucket, file)

	stagingOptions := query.StagingOptions{Bucket: destinationOptions.StagingBucket, File: file}
	err = destClient.StageData(ctx, strings.Join(rowStrings, "\n"), stagingOptions)
	if err != nil {
		return errors.NewCustomerVisibleError(err)
	}
	// always clean up the data in the storage bucket
	defer destClient.CleanUpStagingData(ctx, stagingOptions)

	writeMode := bq.toBigQueryWriteMode(sync.SyncMode)
	orderedObjectFields := bq.createOrderedObjectFields(object.ObjectFields, fieldMappings)
	csvSchema := bq.createCsvSchema(object.EndCustomerIdField, orderedObjectFields)
	err = destClient.LoadFromStaging(ctx, *object.Namespace, *object.TableName, query.LoadOptions{
		GcsReference:   gcsReference,
		BigQuerySchema: csvSchema,
		WriteMode:      writeMode,
	})
	if err != nil {
		return errors.NewCustomerVisibleError(err)
	}

	return nil
}

func (bq BigQueryImpl) toBigQueryWriteMode(syncMode models.SyncMode) bigquery.TableWriteDisposition {
	switch syncMode {
	case models.SyncModeFullOverwrite:
		return bigquery.WriteTruncate
	case models.SyncModeFullAppend:
		return bigquery.WriteAppend
	case models.SyncModeIncrementalAppend:
		return bigquery.WriteAppend
	case models.SyncModeIncrementalUpdate:
		// incremental update loads updated/new rows into a temp table, before merging with the destination
		return bigquery.WriteTruncate
	default:
		return bigquery.WriteAppend
	}
}

func (bq BigQueryImpl) createOrderedObjectFields(objectFields []views.ObjectField, fieldMappings []views.FieldMapping) []views.ObjectField {
	objectFieldIdToObjectField := make(map[int64]views.ObjectField)
	for _, objectField := range objectFields {
		objectFieldIdToObjectField[objectField.ID] = objectField
	}

	var orderedObjectFields []views.ObjectField
	for _, fieldMapping := range fieldMappings {
		orderedObjectFields = append(orderedObjectFields, objectFieldIdToObjectField[fieldMapping.DestinationFieldId])
	}

	return orderedObjectFields
}

func (bq BigQueryImpl) createCsvSchema(endCustomerIdColumn string, orderedObjectFields []views.ObjectField) bigquery.Schema {
	var csvSchema bigquery.Schema
	for _, objectField := range orderedObjectFields {
		field := bigquery.FieldSchema{
			Name:     objectField.Name,
			Type:     getBigQueryType(objectField.Type),
			Required: !objectField.Optional,
		}
		csvSchema = append(csvSchema, &field)
	}

	endCustomerIdField := bigquery.FieldSchema{
		Name:     endCustomerIdColumn,
		Type:     bigquery.IntegerFieldType,
		Required: true,
	}
	csvSchema = append(csvSchema, &endCustomerIdField)

	return csvSchema
}

func getBigQueryType(fieldType data.FieldType) bigquery.FieldType {
	switch fieldType {
	case data.FieldTypeInteger:
		return bigquery.IntegerFieldType
	case data.FieldTypeNumber:
		return bigquery.NumericFieldType
	case data.FieldTypeBoolean:
		return bigquery.BooleanFieldType
	case data.FieldTypeTimestamp:
		return bigquery.TimestampFieldType
	case data.FieldTypeDateTimeTz, data.FieldTypeDateTimeNtz:
		return bigquery.DateTimeFieldType
	case data.FieldTypeJson:
		return bigquery.JSONFieldType
	case data.FieldTypeDate:
		return bigquery.DateFieldType
	case data.FieldTypeTimeTz, data.FieldTypeTimeNtz:
		return bigquery.TimeFieldType
	default:
		return bigquery.StringFieldType
	}
}
