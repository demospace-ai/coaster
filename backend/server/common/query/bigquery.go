package query

import (
	"context"
	"fmt"

	"cloud.google.com/go/bigquery"
	"go.fabra.io/server/common/data"
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

	return convertBigQueryRow(row), nil
}

// TODO: this must be in order
func (it BigQueryIterator) Schema() data.Schema {
	return convertBigQuerySchema(it.Iterator.Schema)
}

func (ac BigQueryApiClient) openConnection(ctx context.Context) (*bigquery.Client, error) {
	if ac.ProjectID == nil {
		return nil, fmt.Errorf("missing project ID")
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
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
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
			return nil, err
		}

		results = append(results, table.TableID)
	}

	return results, nil
}

func (ac BigQueryApiClient) GetTableSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
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

		schema = append(schema, data.ColumnSchema{Name: row[3].(string), Type: getBigQueryColumnType(row[6].(string))})
	}

	return schema, nil
}

func (ac BigQueryApiClient) GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]any, error) {
	queryString := "SELECT DISTINCT " + columnName + " FROM " + namespace + "." + tableName + " LIMIT 50"

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
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
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
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
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
		fmt.Printf("query: %s", queryString)
		return nil, err
	}

	// If an error happens here it isn't actually a failure, the query was just wrong. Send the details back.
	// TODO: make special error type for this
	status, err := job.Wait(ctx)
	if err != nil {
		fmt.Printf("qu3ery: %s", queryString)
		return nil, err
	}
	if err := status.Err(); err != nil {
		fmt.Printf("quer2y: %s", queryString)
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
		results = append(results, convertBigQueryRow(row))
	}

	return &data.QueryResults{
		Schema: convertBigQuerySchema(it.Schema),
		Data:   results,
	}, nil
}

func (ac BigQueryApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	client, err := ac.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
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

func convertBigQueryRow(bigQueryRow []bigquery.Value) data.Row {
	var row data.Row
	for _, value := range bigQueryRow {
		row = append(row, any(value))
	}

	return row
}

func getBigQueryColumnType(bigQueryType string) data.ColumnType {
	switch bigQueryType {
	case "INTEGER", "INT64":
		return data.ColumnTypeInteger
	case "FLOAT", "NUMERIC", "BIGNUMERIC":
		return data.ColumnTypeNumber
	case "BOOLEAN":
		return data.ColumnTypeBoolean
	case "TIMESTAMP":
		return data.ColumnTypeTimestampTz
	case "JSON":
		return data.ColumnTypeJson
	case "DATE":
		return data.ColumnTypeDate
	case "TIME":
		return data.ColumnTypeTime
	case "DATETIME":
		return data.ColumnTypeDateTime
	default:
		return data.ColumnTypeString
	}
}

func convertBigQuerySchema(bigQuerySchema bigquery.Schema) data.Schema {
	schema := data.Schema{}

	for _, bigQuerySchemaField := range bigQuerySchema {
		columnSchema := data.ColumnSchema{
			Name: bigQuerySchemaField.Name,
			Type: getBigQueryColumnType(string(bigQuerySchemaField.Type)),
		}

		schema = append(schema, columnSchema)
	}

	return schema
}
