package query

import (
	"context"
	"fmt"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type BigQueryApiClient struct {
	GCPProjectID   *string
	GCPCredentials *string
}

func (ac BigQueryApiClient) openConnection(ctx context.Context) (*bigquery.Client, error) {
	if ac.GCPProjectID == nil {
		return nil, fmt.Errorf("missing project ID")
	}

	var credentialOption option.ClientOption
	if ac.GCPCredentials != nil {
		credentialOption = option.WithCredentialsJSON([]byte(*ac.GCPCredentials))
	}

	return bigquery.NewClient(ctx, *ac.GCPProjectID, credentialOption)
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

func (ac BigQueryApiClient) GetTableSchema(ctx context.Context, namespace string, tableName string) (Schema, error) {
	queryString := "select * from " + namespace + ".INFORMATION_SCHEMA.COLUMNS where table_name = '" + tableName + "'"

	queryResult, err := ac.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	schema := Schema{}
	for _, row := range queryResult.Data {
		if row[0] == nil {
			continue
		}

		schema = append(schema, ColumnSchema{Name: row[3].(string), Type: row[6].(string)})
	}

	return schema, nil
}

func (ac BigQueryApiClient) GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]Value, error) {
	queryString := "SELECT DISTINCT " + columnName + " FROM " + namespace + "." + tableName + " LIMIT 50"

	queryResult, err := ac.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	values := []Value{}
	for _, row := range queryResult.Data {
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

func (ac BigQueryApiClient) RunQuery(ctx context.Context, queryString string) (*QueryResult, error) {
	client, err := ac.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}
	defer client.Close()

	q := client.Query(queryString)
	// Location must match that of the dataset(s) referenced in the query.
	q.Location = "US"
	// Run the query and print results when the query job is completed.
	job, err := q.Run(ctx)
	if err != nil {
		return nil, err
	}
	status, err := job.Wait(ctx)

	// Both of these are not actually a failure, the query was just wrong. Send the details back to them.
	if err != nil {
		result := QueryResult{
			Success:      false,
			ErrorMessage: err.Error(),
		}

		return &result, nil
	}
	if err := status.Err(); err != nil {
		result := QueryResult{
			Success:      false,
			ErrorMessage: err.Error(),
		}

		return &result, nil
	}

	var results []Row
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

	queryResult := QueryResult{
		Success: true,
		Schema:  convertBigQuerySchema(it.Schema),
		Data:    results,
	}
	return &queryResult, nil
}

func convertBigQueryRow(bigQueryRow []bigquery.Value) Row {
	var row Row
	for _, value := range bigQueryRow {
		row = append(row, Value(value))
	}

	return row
}

func convertBigQuerySchema(bigQuerySchema bigquery.Schema) Schema {
	schema := Schema{}

	for _, bigQuerySchemaField := range bigQuerySchema {
		columnSchema := ColumnSchema{
			Name: bigQuerySchemaField.Name,
			Type: string(bigQuerySchemaField.Type),
		}

		schema = append(schema, columnSchema)
	}

	return schema
}
