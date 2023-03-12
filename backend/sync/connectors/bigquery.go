package connectors

import (
	"context"
	"fmt"
	"strings"

	"cloud.google.com/go/bigquery"
	"github.com/google/uuid"
	"go.fabra.io/server/common/data"
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

func (bq BigQueryImpl) Read(ctx context.Context, sourceConnection views.FullConnection, sync views.Sync, fieldMappings []views.FieldMapping) ([]data.Row, error) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := bq.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		return nil, err
	}
	sourceClient := sc.(query.BigQueryApiClient)

	readQuery := bq.getReadQuery(connectionModel, sync, fieldMappings)

	results, err := sourceClient.RunQuery(ctx, readQuery)
	if err != nil {
		return nil, err
	}

	return results.Data, nil
}

// TODO: only read 10,000 rows at once or something
func (bq BigQueryImpl) getReadQuery(sourceConnection *models.Connection, sync views.Sync, fieldMappings []views.FieldMapping) string {
	if len(sync.CustomJoin) > 0 {
		return sync.CustomJoin
	}

	selectString := bq.getSelectString(fieldMappings)
	return fmt.Sprintf("SELECT %s FROM %s.%s;", selectString, sync.Namespace, sync.TableName)
}

func (bq BigQueryImpl) getSelectString(fieldMappings []views.FieldMapping) string {
	columns := []string{}
	for _, fieldMapping := range fieldMappings {
		columns = append(columns, fieldMapping.SourceFieldName)
	}

	return strings.Join(columns, ",")
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
	orderedObjectFields := bq.createOrderedObjectFields(object.ObjectFields, fieldMappings)
	rowStrings := []string{}
	for _, row := range rows {
		var rowTokens []string
		for i, value := range row {
			sourceType := fieldMappings[i].SourceFieldType
			if value == nil {
				rowTokens = append(rowTokens, "") // empty string for null values will be interpreted correctly
			} else {
				switch sourceType {
				case data.ColumnTypeObject:
					// JSON-like values need to be escaped according to BigQuery expectations. Even if the destination
					// type is not JSON, it is necessary to escape to avoid issues
					// https://cloud.google.com/bigquery/docs/reference/standard-sql/json-data#load_from_csv_files
					escapedValue := fmt.Sprintf("\"%s\"", strings.ReplaceAll(fmt.Sprintf("%v", value), "\"", "\"\""))
					rowTokens = append(rowTokens, escapedValue)
				case data.ColumnTypeString:
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
		return err
	}

	csvSchema := bq.createCsvSchema(object.EndCustomerIdColumn, orderedObjectFields)
	err = destClient.LoadFromStaging(ctx, object.Namespace, object.TableName, query.LoadOptions{
		GcsReference:   gcsReference,
		BigQuerySchema: csvSchema,
		WriteMode:      bq.toBigQueryWriteMode(sync.SyncMode),
	})
	if err != nil {
		return err
	}

	return destClient.CleanUpStagingData(ctx, stagingOptions)
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
			Name: objectField.Name,
			Type: objectField.Type.ToBigQueryType(),
		}
		csvSchema = append(csvSchema, &field)
	}

	endCustomerIdField := bigquery.FieldSchema{
		Name: endCustomerIdColumn,
		Type: bigquery.IntegerFieldType,
	}
	csvSchema = append(csvSchema, &endCustomerIdField)

	return csvSchema
}
