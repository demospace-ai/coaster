package query

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/snowflakedb/gosnowflake"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
)

type SnowflakeApiClient struct {
	Username      string
	Password      string
	WarehouseName string
	DatabaseName  string
	Role          string
	Host          string
}

type SnowflakeIterator struct {
	queryResult sql.Rows
	schema      data.Schema
}

type snowflakeSchema struct {
	Type string `json:"type"`
}

func (it SnowflakeIterator) Next() (data.Row, error) {
	if it.queryResult.Next() {
		var row []any
		err := it.queryResult.Scan(&row)
		if err != nil {
			return nil, err
		}
		return convertSnowflakeRow(row), nil
	}

	return nil, data.ErrDone
}

// TODO: this must be in order
func (it SnowflakeIterator) Schema() data.Schema {
	return it.schema
}

func (sc SnowflakeApiClient) openConnection(ctx context.Context) (*sql.DB, error) {
	account := strings.Split(sc.Host, ".")[0] // TODO: remove the https/http
	config := gosnowflake.Config{
		Account:   account,
		User:      sc.Username,
		Password:  sc.Password,
		Warehouse: sc.WarehouseName,
		Database:  sc.DatabaseName,
		Role:      sc.Role,
		Host:      sc.Host,
		Port:      443,
	}

	dsn, err := gosnowflake.DSN(&config)
	if err != nil {
		return nil, err
	}

	return sql.Open("snowflake", dsn)
}

func (sc SnowflakeApiClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "opening connection for get table")
	}

	defer client.Close()

	queryString := fmt.Sprintf("SHOW TERSE TABLES IN %s", namespace)
	queryResult, err := client.Query(queryString)
	if err != nil {
		return nil, errors.Wrapf(err, "running query %s", queryString)
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

		tableNames = append(tableNames, values[1].(string))
	}

	return tableNames, nil
}

func (sc SnowflakeApiClient) GetSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
	queryString := fmt.Sprintf("SHOW COLUMNS IN %s.%s", namespace, tableName)

	queryResult, err := sc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, errors.Wrapf(err, "getting schema for %s.%s", namespace, tableName)
	}

	schema := data.Schema{}
	for _, row := range queryResult.Data {
		if row[0] == nil {
			continue
		}

		var snowflakeSchema snowflakeSchema
		err := json.Unmarshal([]byte(row[3].(string)), &snowflakeSchema)
		if err != nil {
			return nil, err
		}

		dataType := getSnowflakeFieldType(snowflakeSchema.Type)
		schema = append(schema, data.Field{Name: row[2].(string), Type: dataType})
	}

	return schema, nil
}

func (sc SnowflakeApiClient) GetFieldValues(ctx context.Context, namespace string, tableName string, fieldName string) ([]any, error) {
	queryString := fmt.Sprintf("SELECT DISTINCT %s FROM %s.%s LIMIT 100", fieldName, namespace, tableName)

	queryResult, err := sc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	values := []any{}
	for _, row := range queryResult.Data {
		if row[0] == nil {
			continue
		}

		values = append(values, row[0])
	}

	return values, nil
}

func (sc SnowflakeApiClient) GetNamespaces(ctx context.Context) ([]string, error) {
	queryString := "SHOW TERSE SCHEMAS"
	queryResult, err := sc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	var namespaces []string
	for _, row := range queryResult.Data {
		if row[0] == nil {
			continue
		}

		namespaces = append(namespaces, row[1].(string))
	}

	return namespaces, nil
}

func (sc SnowflakeApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	queryResult, err := client.Query(queryString, args)
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
			return nil, err
		}

		rows = append(rows, convertSnowflakeRow(values))
	}

	return &data.QueryResults{
		Schema: convertSnowflakeSchema(columns),
		Data:   rows,
	}, nil
}

func (sc SnowflakeApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	client, err := sc.openConnection(ctx)
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

	return SnowflakeIterator{queryResult: *queryResult, schema: convertSnowflakeSchema(columns)}, nil
}

func convertSnowflakeRow(snowflakeRow []any) data.Row {
	var row data.Row
	for _, value := range snowflakeRow {
		row = append(row, convertSnowflakeValue(value))
	}

	return row
}

func convertSnowflakeValue(snowflakeValue any) any {
	// TODO: convert the values to the expected Fabra Golang types
	return snowflakeValue
}

func getSnowflakeFieldType(snowflakeType string) data.FieldType {
	switch snowflakeType {
	case "BIT", "BOOLEAN":
		return data.FieldTypeBoolean
	case "INTEGER", "BIGINT", "SMALLINT", "TINYINT":
		return data.FieldTypeInteger
	case "REAL", "DOUBLE", "DECIMAL", "NUMERIC", "FLOAT", "FIXED":
		return data.FieldTypeNumber
	case "TIMESTAMP_TZ":
		return data.FieldTypeTimestampTz
	case "TIMESTAMP", "TIMESTAMP_NTZ":
		return data.FieldTypeTimestampNtz
	default:
		// Everything can always be treated as a string
		return data.FieldTypeString
	}
}

func convertSnowflakeSchema(columns []*sql.ColumnType) data.Schema {
	schema := data.Schema{}

	for _, column := range columns {
		field := data.Field{
			Name: column.Name(),
			Type: getSnowflakeFieldType(column.DatabaseTypeName()),
		}

		schema = append(schema, field)
	}

	return schema
}
