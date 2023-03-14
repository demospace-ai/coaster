package query

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/bigquery"
	"cloud.google.com/go/civil"
	"cloud.google.com/go/storage"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type BigQueryApiClient struct {
	ProjectID   *string
	Credentials *string
	Location    *string
}

type BigQueryIterator struct {
	Iterator *bigquery.RowIterator
}

func (it BigQueryIterator) Next() (data.Row, error) {
	var row []bigquery.Value
	err := it.Iterator.Next(&row)
	if err == iterator.Done {
		return nil, data.ErrDone
	}

	if err != nil {
		return nil, err
	}

	return convertBigQueryRow(row, it.Iterator.Schema), nil
}

// TODO: this must be in order
func (it BigQueryIterator) Schema() data.Schema {
	return convertBigQuerySchema(it.Iterator.Schema)
}

func (ac BigQueryApiClient) openConnection(ctx context.Context) (*bigquery.Client, error) {
	if ac.ProjectID == nil {
		return nil, errors.Newf("missing project ID")
	}

	var credentialOption option.ClientOption
	if ac.Credentials != nil {
		credentialOption = option.WithCredentialsJSON([]byte(*ac.Credentials))
	}

	return bigquery.NewClient(ctx, *ac.ProjectID, credentialOption)
}

func (ac BigQueryApiClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
	client, err := ac.openConnection(ctx)
	if err != nil {
		return nil, err
	}

	defer client.Close()

	ts := client.Dataset(namespace).Tables(ctx)
	var results []string
	for {
		table, err := ts.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, errors.Wrapf(err, "getting tables for namespace %s", namespace)
		}

		results = append(results, table.TableID)
	}

	return results, nil
}

func (ac BigQueryApiClient) GetSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
	queryString := "SELECT * FROM " + namespace + ".INFORMATION_SCHEMA.COLUMNS WHERE table_name = '" + tableName + "'"

	queryResults, err := ac.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	schema := data.Schema{}
	for _, row := range queryResults.Data {
		if row[0] == nil {
			continue
		}

		schema = append(schema, data.Field{Name: row[3].(string), Type: getBigQueryFieldType(row[6].(string))})
	}

	return schema, nil
}

func (ac BigQueryApiClient) GetFieldValues(ctx context.Context, namespace string, tableName string, fieldName string) ([]any, error) {
	queryString := fmt.Sprintf("SELECT DISTINCT %s FROM %s.%s LIMIT 100", fieldName, namespace, tableName)

	queryResults, err := ac.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	values := []any{}
	for _, row := range queryResults.Data {
		if row[0] == nil {
			continue
		}

		values = append(values, row[0])
	}

	return values, nil
}

func (ac BigQueryApiClient) GetNamespaces(ctx context.Context) ([]string, error) {
	client, err := ac.openConnection(ctx)
	if err != nil {
		return nil, err
	}

	defer client.Close()

	ts := client.Datasets(ctx)
	var results []string
	for {
		dataset, err := ts.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		results = append(results, dataset.DatasetID)
	}

	return results, nil
}

func (ac BigQueryApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
	client, err := ac.openConnection(ctx)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	q := client.Query(queryString)
	for arg := range args {
		q.Parameters = append(q.Parameters, bigquery.QueryParameter{Value: arg})
	}

	// Location must match that of the dataset(s) referenced in the query.
	q.Location = *ac.Location

	// Run the query and print results when the query job is completed.
	job, err := q.Run(ctx)
	if err != nil {
		return nil, err
	}

	// If an error happens here it isn't actually a failure, the query was just wrong. Send the details back.
	// TODO: make special error type for this
	status, err := job.Wait(ctx)
	if err != nil {
		return nil, err
	}
	if err := status.Err(); err != nil {
		return nil, err
	}

	var results []data.Row
	it, err := job.Read(ctx)
	if err != nil {
		return nil, err
	}

	for {
		var row []bigquery.Value
		err := it.Next(&row)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		results = append(results, convertBigQueryRow(row, it.Schema))
	}

	return &data.QueryResults{
		Schema: convertBigQuerySchema(it.Schema),
		Data:   results,
	}, nil
}

func (ac BigQueryApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	client, err := ac.openConnection(ctx)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	q := client.Query(queryString)

	// Location must match that of the dataset(s) referenced in the query.
	q.Location = *ac.Location

	// Run the query and print results when the query job is completed.
	job, err := q.Run(ctx)
	if err != nil {
		return nil, err
	}

	// Both of these are not actually a failure, the query was just wrong. Send the details back to them.
	_, err = job.Wait(ctx)
	if err != nil {
		return nil, err
	}

	it, err := job.Read(ctx)
	if err != nil {
		return nil, err
	}

	return BigQueryIterator{
		Iterator: it,
	}, nil
}

func (ac BigQueryApiClient) StageData(ctx context.Context, csvData string, stagingOptions StagingOptions) error {
	var credentialOption option.ClientOption
	if ac.Credentials != nil {
		credentialOption = option.WithCredentialsJSON([]byte(*ac.Credentials))
	}

	gcsClient, err := storage.NewClient(ctx, credentialOption)
	if err != nil {
		return err
	}
	defer gcsClient.Close()

	w := gcsClient.Bucket(stagingOptions.Bucket).Object(stagingOptions.File).NewWriter(ctx)
	if _, err := fmt.Fprint(w, csvData); err != nil {
		return err
	}

	if err := w.Close(); err != nil {
		return err
	}

	return nil
}

func (ac BigQueryApiClient) LoadFromStaging(ctx context.Context, namespace string, tableName string, loadOptions LoadOptions) error {
	client, err := ac.openConnection(ctx)
	if err != nil {
		return err
	}
	defer client.Close()

	gcsRef := bigquery.NewGCSReference(loadOptions.GcsReference)
	gcsRef.SourceFormat = bigquery.CSV
	gcsRef.Schema = loadOptions.BigQuerySchema

	loader := client.Dataset(namespace).Table(tableName).LoaderFrom(gcsRef)
	loader.WriteDisposition = loadOptions.WriteMode

	job, err := loader.Run(ctx)
	if err != nil {
		return err
	}
	status, err := job.Wait(ctx)
	if err != nil {
		return err
	}

	return status.Err()
}

func (ac BigQueryApiClient) CleanUpStagingData(ctx context.Context, stagingOptions StagingOptions) error {
	var credentialOption option.ClientOption
	if ac.Credentials != nil {
		credentialOption = option.WithCredentialsJSON([]byte(*ac.Credentials))
	}

	gcsClient, err := storage.NewClient(ctx, credentialOption)
	if err != nil {
		return err
	}
	defer gcsClient.Close()

	object := gcsClient.Bucket(stagingOptions.Bucket).Object(stagingOptions.File)
	return object.Delete(ctx)
}

func convertBigQueryRow(bigQueryRow []bigquery.Value, schema bigquery.Schema) data.Row {
	var row data.Row
	for i, value := range bigQueryRow {
		fieldType := schema[i].Type
		switch fieldType {
		case bigquery.TimestampFieldType:
			row = append(row, value.(time.Time).Format(FABRA_TIMESTAMP_TZ_FORMAT))
		case bigquery.DateFieldType:
			row = append(row, value.(civil.Date).String())
		case bigquery.TimeFieldType:
			row = append(row, value.(civil.Time).String())
		case bigquery.DateTimeFieldType:
			row = append(row, value.(civil.DateTime).String())
		default:
			row = append(row, any(value))
		}
	}

	return row
}

func getBigQueryFieldType(bigQueryType string) data.FieldType {
	switch bigQueryType {
	case "INTEGER", "INT64":
		return data.FieldTypeInteger
	case "FLOAT", "NUMERIC", "BIGNUMERIC":
		return data.FieldTypeNumber
	case "BOOLEAN":
		return data.FieldTypeBoolean
	case "TIMESTAMP":
		return data.FieldTypeTimestampTz
	case "JSON":
		return data.FieldTypeJson
	case "DATE":
		return data.FieldTypeDate
	case "TIME":
		return data.FieldTypeTimeNtz
	case "DATETIME":
		return data.FieldTypeDateTime
	default:
		return data.FieldTypeString
	}
}

func convertBigQuerySchema(bigQuerySchema bigquery.Schema) data.Schema {
	schema := data.Schema{}

	for _, bigQuerySchemaField := range bigQuerySchema {
		field := data.Field{
			Name: bigQuerySchemaField.Name,
			Type: getBigQueryFieldType(string(bigQuerySchemaField.Type)),
		}

		schema = append(schema, field)
	}

	return schema
}
