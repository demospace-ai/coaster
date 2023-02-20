package query

import (
	"context"
	"fmt"

	"cloud.google.com/go/bigquery"
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

func (it BigQueryIterator) Next() (Row, error) {
	var row []bigquery.Value
	err := it.Iterator.Next(&row)
	if err == iterator.Done {
		return nil, ErrDone
	}

	if err != nil {
		return nil, err
	}

	return convertBigQueryRow(row), nil
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

func (ac BigQueryApiClient) GetTableSchema(ctx context.Context, namespace string, tableName string) (Schema, error) {
	queryString := "SELECT * FROM " + namespace + ".INFORMATION_SCHEMA.COLUMNS WHERE table_name = '" + tableName + "'"

	rows, err := ac.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	schema := Schema{}
	for _, row := range rows {
		if row[0] == nil {
			continue
		}

		schema = append(schema, ColumnSchema{Name: row[3].(string), Type: row[6].(string)})
	}

	return schema, nil
}

func (ac BigQueryApiClient) GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]Value, error) {
	queryString := "SELECT DISTINCT " + columnName + " FROM " + namespace + "." + tableName + " LIMIT 50"

	rows, err := ac.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	values := []Value{}
	for _, row := range rows {
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

func (ac BigQueryApiClient) RunQuery(ctx context.Context, queryString string, args ...any) ([]Row, error) {
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

	return results, nil
}

func (ac BigQueryApiClient) GetQueryIterator(ctx context.Context, queryString string) (RowIterator, error) {
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

func convertBigQueryRow(bigQueryRow []bigquery.Value) Row {
	var row Row
	for _, value := range bigQueryRow {
		row = append(row, Value(value))
	}

	return row
}
