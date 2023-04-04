package connectors

import (
	"context"
	"encoding/json"
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

func (bq BigQueryImpl) Read(
	ctx context.Context,
	sourceConnection views.FullConnection,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC chan<- []data.Row,
	readOutputC chan<- ReadOutput,
	errC chan<- error,
) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := bq.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		errC <- err
		return
	}
	sourceClient := sc.(query.BigQueryApiClient)

	readQuery := bq.getReadQuery(connectionModel, sync, fieldMappings)

	iterator, err := sourceClient.GetQueryIterator(ctx, readQuery)
	if err != nil {
		errC <- errors.NewCustomerVisibleError(err)
		return
	}

	currentIndex := 0
	var rowBatch []data.Row
	var lastRow data.Row
	for {
		row, err := iterator.Next()
		if err != nil {
			if err == data.ErrDone {
				break
			} else {
				errC <- err
				return
			}
		}

		rowBatch = append(rowBatch, row)
		lastRow = row
		currentIndex++
		if currentIndex == READ_BATCH_SIZE {
			rowsC <- rowBatch
			currentIndex = 0
			rowBatch = []data.Row{}
		}
	}

	// write any remaining roows
	if currentIndex > 0 {
		rowsC <- rowBatch
	}

	newCursorPosition := bq.getNewCursorPosition(lastRow, iterator.Schema(), sync)
	readOutputC <- ReadOutput{
		CursorPosition: newCursorPosition,
	}

	close(rowsC)
	close(errC)
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
			return fmt.Sprintf("%s WHERE %s > %s ORDER BY %s ASC;", queryString, *sync.SourceCursorField, *sync.CursorPosition, *sync.SourceCursorField)
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

func (bq BigQueryImpl) getNewCursorPosition(lastRow data.Row, schema data.Schema, sync views.Sync) *string {
	if sync.SourceCursorField == nil {
		return nil
	}

	if lastRow == nil {
		return nil
	}

	var cursorFieldPos int
	var cursorFieldType data.FieldType
	for i := range schema {
		if schema[i].Name == *sync.SourceCursorField {
			cursorFieldPos = i
			cursorFieldType = schema[i].Type
		}
	}

	// TODO: make sure we don't miss any rows
	// we sort rows by cursor field so just take the last row
	var newCursorPos string
	switch cursorFieldType {
	case data.FieldTypeInteger:
		newCursorPos = fmt.Sprintf("%v", lastRow[cursorFieldPos])
	default:
		newCursorPos = fmt.Sprintf("'%v'", lastRow[cursorFieldPos])
	}

	return &newCursorPos
}

func (bq BigQueryImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC <-chan []data.Row,
	writeOutputC chan<- WriteOutput,
	errC chan<- error,
) {
	connectionModel := views.ConvertConnectionView(destinationConnection)

	dc, err := bq.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		errC <- err
		return
	}
	destClient := dc.(query.BigQueryApiClient)

	// always clean up the data in the storage bucket
	objectPrefix := uuid.New().String()
	wildcardObject := fmt.Sprintf("%s-*", objectPrefix)
	gcsReference := fmt.Sprintf("gs://%s/%s", destinationOptions.StagingBucket, wildcardObject)
	defer destClient.CleanUpStagingData(ctx, query.StagingOptions{Bucket: destinationOptions.StagingBucket, Object: wildcardObject})

	batchNum := 0
	rowsWritten := 0
	for {
		rows, more := <-rowsC
		if !more {
			break
		}

		rowsWritten += len(rows)
		objectName := fmt.Sprintf("%s-%d", objectPrefix, batchNum)
		err = bq.stageBatch(ctx, rows, fieldMappings, sync, destinationOptions, destClient, objectName)
		if err != nil {
			errC <- err
			return
		}

		batchNum++
	}

	writeMode := bq.toBigQueryWriteMode(sync.SyncMode)
	orderedObjectFields := bq.createOrderedObjectFields(object.ObjectFields, fieldMappings)
	csvSchema := bq.createCsvSchema(object.EndCustomerIdField, orderedObjectFields)
	err = destClient.LoadFromStaging(ctx, *object.Namespace, *object.TableName, query.LoadOptions{
		GcsReference:   gcsReference,
		BigQuerySchema: csvSchema,
		WriteMode:      writeMode,
	})
	if err != nil {
		errC <- errors.NewCustomerVisibleError(err)
		return
	}

	writeOutputC <- WriteOutput{
		RowsWritten: rowsWritten,
	}

	close(errC)
}

func (bq BigQueryImpl) stageBatch(ctx context.Context, rows []data.Row, fieldMappings []views.FieldMapping, sync views.Sync, destinationOptions DestinationOptions, destClient query.BigQueryApiClient, objectName string) error {
	// allocate the arrays and reuse them to save memory
	rowStrings := make([]string, len(rows))
	rowTokens := make([]string, len(fieldMappings)+1)                     // one extra token for the end customer ID
	rowTokens[len(fieldMappings)] = fmt.Sprintf("%d", sync.EndCustomerID) // end customer ID will be the same for every row

	// TODO: batch insert 10,000 rows at a time
	// write to temporary table in destination
	for i, row := range rows {
		for j, value := range row {
			sourceType := fieldMappings[j].SourceFieldType
			if value == nil {
				// empty string for null values will be interpreted as null when loading from csv
				rowTokens[j] = ""
			} else {
				switch sourceType {
				case data.FieldTypeJson:
					// JSON-like values need to be escaped according to BigQuery expectations. Even if the destination
					// type is not JSON, it is necessary to escape to avoid issues
					// https://cloud.google.com/bigquery/docs/reference/standard-sql/json-data#load_from_csv_files
					jsonStr, err := json.Marshal(value)
					if err != nil {
						return err
					}
					escapedValue := fmt.Sprintf("\"%s\"", strings.ReplaceAll(string(jsonStr), "\"", "\"\""))
					rowTokens[j] = escapedValue
				case data.FieldTypeString:
					// escape the string so commas don't break the CSV schema
					rowTokens[j] = fmt.Sprintf("\"%v\"", value)
				default:
					rowTokens[j] = fmt.Sprintf("%v", value)
				}
			}
		}

		rowString := strings.Join(rowTokens, ",")
		rowStrings[i] = rowString
	}

	stagingOptions := query.StagingOptions{Bucket: destinationOptions.StagingBucket, Object: objectName}
	err := destClient.StageData(ctx, strings.Join(rowStrings, "\n"), stagingOptions)
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
	case data.FieldTypeTimestamp, data.FieldTypeDateTimeTz:
		return bigquery.TimestampFieldType
	case data.FieldTypeDateTimeNtz:
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
