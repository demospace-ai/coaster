package query

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/url"

	_ "github.com/lib/pq"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
)

type RedshiftApiClient struct {
	Username     string
	Password     string
	DatabaseName string
	Host         string
}

type RedshiftIterator struct {
	queryResult sql.Rows
	schema      data.Schema
}

func (it RedshiftIterator) Next() (data.Row, error) {
	if it.queryResult.Next() {
		var row []any
		err := it.queryResult.Scan(&row)
		if err != nil {
			return nil, err
		}
		return convertRedshiftRow(row), nil
	}

	return nil, data.ErrDone
}

// TODO: this must be in order
func (it RedshiftIterator) Schema() data.Schema {
	return it.schema
}

func (rc RedshiftApiClient) openConnection(ctx context.Context) (*sql.DB, error) {
	dsn := url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(rc.Username, rc.Password),
		Host:   rc.Host,
		Path:   rc.DatabaseName,
	}

	params := url.Values{}
	params.Add("sslmode", "require")
	dsn.RawQuery = params.Encode()

	return sql.Open("postgres", dsn.String())
}

func (rc RedshiftApiClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
	client, err := rc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("redshift.NewClient: %v", err)
	}

	defer client.Close()

	queryString := fmt.Sprintf("SELECT DISTINCT(tablename) FROM pg_table_def WHERE schemaname = '%s'", namespace)
	queryResult, err := client.Query(queryString)
	if err != nil {
		return nil, err
	}
	defer queryResult.Close()

	columns, err := queryResult.Columns()
	if err != nil {
		return nil, err
	}
	numColumns := len(columns)

	// just scan into a string list, everything can be a string
	var tableNames []string
	values := make([]any, numColumns)
	valuePtrs := make([]any, numColumns)
	for queryResult.Next() {
		for i := 0; i < numColumns; i++ {
			valuePtrs[i] = &values[i]
		}
		err := queryResult.Scan(valuePtrs...)
		if err != nil {
			log.Fatalf("Failed to scan. err: %v", err)
		}

		tableNames = append(tableNames, convertRedshiftValue(values[0]).(string))
	}

	return tableNames, nil
}

func (rc RedshiftApiClient) GetTableSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
	queryString := fmt.Sprintf("SELECT * FROM pg_table_def WHERE schemaname = '%s' AND tablename = '%s'", namespace, tableName)

	queryResult, err := rc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	schema := data.Schema{}
	for _, row := range queryResult.Data {
		dataType := getRedshiftColumnType(convertRedshiftValue(row[3]).(string))
		schema = append(schema, data.ColumnSchema{Name: convertRedshiftValue(row[2]).(string), Type: dataType})
	}

	return schema, nil
}

func (rc RedshiftApiClient) GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]any, error) {
	queryString := fmt.Sprintf("SELECT DISTINCT %s FROM %s.%s LIMIT 100", columnName, namespace, tableName)

	queryResult, err := rc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	values := []any{}
	for _, row := range queryResult.Data {
		values = append(values, convertRedshiftValue(row[0]))
	}

	return values, nil
}

func (rc RedshiftApiClient) GetNamespaces(ctx context.Context) ([]string, error) {
	queryString := "SELECT * FROM pg_namespace WHERE nspname NOT IN ('pg_toast', 'pg_internal', 'catalog_history', 'pg_automv', 'pg_temp_1', 'pg_catalog', 'information_schema')"
	queryResult, err := rc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, errors.Wrap(err, "error running query")
	}

	var namespaces []string
	for _, row := range queryResult.Data {
		namespaces = append(namespaces, convertRedshiftValue(row[0]).(string))
	}

	return namespaces, nil
}

func (rc RedshiftApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
	client, err := rc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("redshift.NewClient: %v", err)
	}
	defer client.Close()

	queryResult, err := client.Query(queryString)
	if err != nil {
		return nil, err
	}
	defer queryResult.Close()

	columns, err := queryResult.ColumnTypes()
	if err != nil {
		return nil, err
	}
	numColumns := len(columns)

	var rows []data.Row
	values := make([]any, numColumns)
	valuePtrs := make([]any, numColumns)
	for queryResult.Next() {
		for i := 0; i < numColumns; i++ {
			valuePtrs[i] = &values[i]
		}
		err := queryResult.Scan(valuePtrs...)
		if err != nil {
			log.Fatalf("Failed to scan. err: %v", err)
		}

		rows = append(rows, convertRedshiftRow(values))
	}

	return &data.QueryResults{
		Schema: convertRedshiftSchema(columns),
		Data:   rows,
	}, nil
}

func (rc RedshiftApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	client, err := rc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("redshift.NewClient: %v", err)
	}
	defer client.Close()

	queryResult, err := client.Query(queryString)
	if err != nil {
		return nil, err
	}

	columns, err := queryResult.ColumnTypes()
	if err != nil {
		return nil, err
	}

	return RedshiftIterator{queryResult: *queryResult, schema: convertRedshiftSchema(columns)}, nil
}

func getRedshiftColumnType(redshiftType string) data.ColumnType {
	switch redshiftType {
	case "BOOL", "BOOLEAN":
		return data.ColumnTypeBoolean
	case "INT", "INT2", "INT4", "INT8", "BIGINT":
		return data.ColumnTypeInteger
	case "FLOAT", "FLOAT4", "FLOAT8", "NUMERIC", "DOUBLE":
		return data.ColumnTypeNumber
	case "DATE":
		return data.ColumnTypeDate
	case "TIMESTAMPTZ", "TIMESTAMP WITH TIME ZONE":
		return data.ColumnTypeTimestampTz
	case "TIMESTAMP", "TIMESTAMP WITHOUT TIME ZONE":
		return data.ColumnTypeTimestampNtz
	case "": // special case for objects with Redshift
		return data.ColumnTypeObject
	default:
		// Everything can always be treated as a string
		return data.ColumnTypeString
	}
}

func convertRedshiftRow(redshiftRow []any) data.Row {
	var row data.Row
	// TODO: convert the values to the expected Fabra Golang types
	for _, value := range redshiftRow {
		v := convertRedshiftValue(value)
		row = append(row, v)
	}

	return row
}

func convertRedshiftValue(redshiftValue any) any {
	switch v := redshiftValue.(type) {
	case []uint8:
		return string([]byte(v))
	default:
		return any(v)
	}
}

func convertRedshiftSchema(columns []*sql.ColumnType) data.Schema {
	schema := data.Schema{}

	for _, column := range columns {
		columnSchema := data.ColumnSchema{
			Name: column.Name(),
			Type: getRedshiftColumnType(column.DatabaseTypeName()),
		}

		schema = append(schema, columnSchema)
	}

	return schema
}
