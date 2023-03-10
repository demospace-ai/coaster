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
)

type BigQueryImpl struct {
	queryService query.QueryService
}

func NewBigQueryConnector(queryService query.QueryService) Connector {
	return BigQueryImpl{
		queryService: queryService,
	}
}

func (bqs BigQueryImpl) Read(ctx context.Context, sourceConnection *models.Connection, sync *models.Sync, fieldMappings []models.FieldMapping) ([]data.Row, error) {
	sc, err := bqs.queryService.GetClient(ctx, sourceConnection)
	if err != nil {
		return nil, err
	}
	sourceClient := sc.(query.BigQueryApiClient)

	readQuery := getReadQuery(sourceConnection, sync, fieldMappings)

	results, err := sourceClient.RunQuery(ctx, readQuery)
	if err != nil {
		return nil, err
	}

	return results.Data, nil
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
		columns = append(columns, fieldMapping.SourceFieldName)
	}

	return strings.Join(columns, ",")
}

func (bqs BigQueryImpl) Write(
	ctx context.Context,
	destinationConnection *models.Connection,
	destination *models.DestinationConnection,
	object *models.Object,
	sync *models.Sync,
	objectFields []models.ObjectField,
	fieldMappings []models.FieldMapping,
	rows []data.Row,
) error {
	dc, err := bqs.queryService.GetClient(ctx, destinationConnection)
	if err != nil {
		return err
	}
	destClient := dc.(query.BigQueryApiClient)

	// TODO: batch insert 10,000 rows at a time
	// write to temporary table in destination
	orderedObjectFields := createOrderedObjectFields(objectFields, fieldMappings)
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

		rowTokens = append(rowTokens, fmt.Sprintf("%d", sync.EndCustomerId))
		rowString := strings.Join(rowTokens, ",")
		rowStrings = append(rowStrings, rowString)
	}

	file := uuid.New().String()
	gcsReference := fmt.Sprintf("gs://%s/%s", destination.StagingBucket.String, file)

	stagingOptions := query.StagingOptions{Bucket: destination.StagingBucket.String, File: file}
	err = destClient.StageData(ctx, strings.Join(rowStrings, "\n"), stagingOptions)
	if err != nil {
		return err
	}

	csvSchema := createCsvSchema(object.EndCustomerIdColumn, orderedObjectFields)
	err = destClient.LoadFromStaging(ctx, object.Namespace, object.TableName, query.LoadOptions{
		GcsReference:   gcsReference,
		BigQuerySchema: csvSchema,
		WriteMode:      toBigQueryWriteMode(sync.SyncMode),
	})
	if err != nil {
		return err
	}

	return destClient.CleanUpStagingData(ctx, stagingOptions)
}

func toBigQueryWriteMode(syncMode models.SyncMode) bigquery.TableWriteDisposition {
	switch syncMode {
	case models.SyncModeFullAppend:
		return bigquery.WriteAppend
	case models.SyncModeFullOverwrite:
		return bigquery.WriteTruncate
	case models.SyncModeIncrementalAppend:
		return bigquery.WriteAppend
	case models.SyncModeIncrementalUpdate:
		return bigquery.WriteAppend
	default:
		return bigquery.WriteAppend
	}
}

func createOrderedObjectFields(objectFields []models.ObjectField, fieldMappings []models.FieldMapping) []models.ObjectField {
	objectFieldIdToObjectField := make(map[int64]models.ObjectField)
	for _, objectField := range objectFields {
		objectFieldIdToObjectField[objectField.ID] = objectField
	}

	var orderedObjectFields []models.ObjectField
	for _, fieldMapping := range fieldMappings {
		orderedObjectFields = append(orderedObjectFields, objectFieldIdToObjectField[fieldMapping.DestinationFieldId])
	}

	return orderedObjectFields
}

func createCsvSchema(endCustomerIdColumn string, orderedObjectFields []models.ObjectField) bigquery.Schema {
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
