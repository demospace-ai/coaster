package query

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"time"

	"cloud.google.com/go/civil"
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
		return convertRedshiftRow(row, it.schema), nil
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
		return nil, err
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
			return nil, err
		}

		// Can hardcode FieldTypeString here because we know what the return value of this query will be
		tableNames = append(tableNames, convertRedshiftValue(values[0], data.FieldTypeString).(string))
	}

	return tableNames, nil
}

func (rc RedshiftApiClient) GetSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
	queryString := fmt.Sprintf("SELECT * FROM pg_table_def WHERE schemaname = '%s' AND tablename = '%s'", namespace, tableName)

	queryResult, err := rc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, errors.Wrapf(err, "getting schema for %s.%s", namespace, tableName)
	}

	schema := data.Schema{}
	for _, row := range queryResult.Data {
		dataType := getRedshiftFieldType(row[3].(string))
		schema = append(schema, data.Field{Name: row[2].(string), Type: dataType})
	}

	return schema, nil
}

func (rc RedshiftApiClient) GetFieldValues(ctx context.Context, namespace string, tableName string, fieldName string) ([]any, error) {
	queryString := fmt.Sprintf("SELECT DISTINCT %s FROM %s.%s LIMIT 100", fieldName, namespace, tableName)

	queryResult, err := rc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	values := []any{}
	for _, row := range queryResult.Data {
		values = append(values, row[0])
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
		namespaces = append(namespaces, row[0].(string))
	}

	return namespaces, nil
}

func (rc RedshiftApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
	client, err := rc.openConnection(ctx)
	if err != nil {
		return nil, err
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
	schema := convertRedshiftSchema(columns)

	var rows []data.Row
	values := make([]any, numColumns)
	valuePtrs := make([]any, numColumns)
	for queryResult.Next() {
		for i := 0; i < numColumns; i++ {
			valuePtrs[i] = &values[i]
		}
		err := queryResult.Scan(valuePtrs...)
		if err != nil {
			return nil, err
		}

		rows = append(rows, convertRedshiftRow(values, schema))
	}

	return &data.QueryResults{
		Schema: schema,
		Data:   rows,
	}, nil
}

func (rc RedshiftApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	client, err := rc.openConnection(ctx)
	if err != nil {
		return nil, err
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

func getRedshiftFieldType(redshiftType string) data.FieldType {
	switch redshiftType {
	case "BOOL", "BOOLEAN":
		return data.FieldTypeBoolean
	case "INT", "INT2", "INT4", "INT8", "BIGINT":
		return data.FieldTypeInteger
	case "FLOAT", "FLOAT4", "FLOAT8", "NUMERIC", "DOUBLE":
		return data.FieldTypeNumber
	case "DATE":
		return data.FieldTypeDate
	case "TIMESTAMPTZ", "TIMESTAMP WITH TIME ZONE":
		return data.FieldTypeTimestampTz
	case "TIMESTAMP", "TIMESTAMP WITHOUT TIME ZONE":
		return data.FieldTypeTimestampNtz
	case "":
		// Objects from Redshift will have an empty type
		return data.FieldTypeJson
	default:
		// Everything can always be treated as a string
		return data.FieldTypeString
	}
}

func convertRedshiftRow(redshiftRow []any, schema data.Schema) data.Row {
	var row data.Row
	for i, value := range redshiftRow {
		row = append(row, convertRedshiftValue(value, schema[i].Type))
	}

	return row
}

func convertRedshiftValue(redshiftValue any, fieldType data.FieldType) any {
	// TODO: convert the values to the expected Fabra Golang types
	switch fieldType {
	case data.FieldTypeTimestampTz:
		return redshiftValue.(time.Time).Format(FABRA_TIMESTAMP_TZ_FORMAT)
	case data.FieldTypeTimestampNtz:
		return civil.DateTimeOf(redshiftValue.(time.Time)).String()
	case data.FieldTypeString:
		// Redshift strings are sometimes returned as uint8 slices
		if v, ok := redshiftValue.([]uint8); ok {
			return string([]byte(v))
		}
		return string([]byte(redshiftValue.(string)))
	default:
		return redshiftValue
	}
}

func convertRedshiftSchema(columns []*sql.ColumnType) data.Schema {
	schema := data.Schema{}

	for _, column := range columns {
		field := data.Field{
			Name: column.Name(),
			Type: getRedshiftFieldType(column.DatabaseTypeName()),
		}

		schema = append(schema, field)
	}

	return schema
}
