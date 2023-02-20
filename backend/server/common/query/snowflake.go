package query

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/snowflakedb/gosnowflake"
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
}

type snowflakeSchema struct {
	Type string `json:"type"`
}

func (it SnowflakeIterator) Next() (Row, error) {
	if it.queryResult.Next() {
		var row []interface{}
		err := it.queryResult.Scan(&row)
		if err != nil {
			return nil, err
		}
		return convertSnowflakeRow(row), nil
	}

	return nil, ErrDone
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
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Close()

	queryResult, err := client.Query("SHOW TERSE TABLES IN " + namespace)
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
	values := make([]interface{}, numColumns)
	valuePtrs := make([]interface{}, numColumns)
	for queryResult.Next() {
		for i := 0; i < numColumns; i++ {
			valuePtrs[i] = &values[i]
		}
		err := queryResult.Scan(valuePtrs...)
		if err != nil {
			log.Fatalf("Failed to scan. err: %v", err)
		}

		tableNames = append(tableNames, values[1].(string))
	}

	return tableNames, nil
}

func (sc SnowflakeApiClient) GetTableSchema(ctx context.Context, namespace string, tableName string) (Schema, error) {
	queryString := "SHOW COLUMNS IN " + namespace + "." + tableName

	rows, err := sc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	schema := Schema{}
	for _, row := range rows {
		if row[0] == nil {
			continue
		}

		dataType, err := getSnowflakeColumnType(row[3])
		if err != nil {
			return nil, err
		}
		schema = append(schema, ColumnSchema{Name: row[2].(string), Type: dataType})
	}

	return schema, nil
}

func (sc SnowflakeApiClient) GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]Value, error) {
	queryString := "SELECT DISTINCT " + columnName + " FROM " + namespace + "." + tableName + " LIMIT 50"

	rows, err := sc.RunQuery(ctx, queryString)
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

func (sc SnowflakeApiClient) GetNamespaces(ctx context.Context) ([]string, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Close()

	queryString := "SHOW TERSE SCHEMAS"
	rows, err := sc.RunQuery(ctx, queryString)
	if err != nil {
		return nil, err
	}

	var namespaces []string
	for _, row := range rows {
		if row[0] == nil {
			continue
		}

		namespaces = append(namespaces, row[1].(string))
	}

	return namespaces, nil
}

func (sc SnowflakeApiClient) RunQuery(ctx context.Context, queryString string, args ...any) ([]Row, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}
	defer client.Close()

	queryResult, err := client.Query(queryString, args)
	if err != nil {
		return nil, err
	}
	defer queryResult.Close()

	columns, err := queryResult.Columns()
	if err != nil {
		return nil, err
	}
	numColumns := len(columns)

	var rows []Row
	values := make([]interface{}, numColumns)
	valuePtrs := make([]interface{}, numColumns)
	for queryResult.Next() {
		for i := 0; i < numColumns; i++ {
			valuePtrs[i] = &values[i]
		}
		err := queryResult.Scan(valuePtrs...)
		if err != nil {
			log.Fatalf("Failed to scan. err: %v", err)
		}

		rows = append(rows, convertSnowflakeRow(values))
	}

	return rows, nil
}

func (sc SnowflakeApiClient) GetQueryIterator(ctx context.Context, queryString string) (RowIterator, error) {
	client, err := sc.openConnection(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}
	defer client.Close()

	queryResult, err := client.Query(queryString)
	if err != nil {
		return nil, err
	}

	return SnowflakeIterator{queryResult: *queryResult}, nil
}

func convertSnowflakeRow(snowflakeRow []interface{}) Row {
	var row Row
	for _, value := range snowflakeRow {
		row = append(row, Value(value))
	}

	return row
}

func getSnowflakeColumnType(rawValue interface{}) (string, error) {
	var snowflakeSchema snowflakeSchema
	err := json.Unmarshal([]byte(rawValue.(string)), &snowflakeSchema)
	if err != nil {
		return "", err
	}

	return snowflakeSchema.Type, nil
}
