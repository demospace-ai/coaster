package query

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/url"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
)

type SynapseApiClient struct {
	Username     string
	Password     string
	DatabaseName string
	Host         string
}

type synapseSchema struct {
	Type string `json:"type"`
}

type synapseIterator struct {
	queryResult sql.Rows
	schema      data.Schema
}

func (it *synapseIterator) Next(_ context.Context) (data.Row, error) {
	if it.queryResult.Next() {
		var row []any
		err := it.queryResult.Scan(&row)
		if err != nil {
			return nil, err
		}
		return convertSynapseRow(row), nil
	}

	defer it.queryResult.Close()
	err := it.queryResult.Err()
	if err != nil {
		return nil, err
	}

	return nil, data.ErrDone
}

// TODO: this must be in order
func (it *synapseIterator) Schema() data.Schema {
	return it.schema
}

func (sc SynapseApiClient) openConnection(ctx context.Context) (*sql.DB, error) {
	params := url.Values{}
	params.Add("daabase", sc.DatabaseName)
	params.Add("sslmode", "encrypt")
	params.Add("TrustServerCertificate", "true")
	dsn := url.URL{
		Scheme:   "sqlserver",
		User:     url.UserPassword(sc.Username, sc.Password),
		Host:     sc.Host,
		RawQuery: params.Encode(),
	}

	return sql.Open("sqlserver", dsn.String())
}

func (sc SynapseApiClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
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

func (sc SynapseApiClient) GetSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error) {
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

		var synapseSchema synapseSchema
		err := json.Unmarshal([]byte(row[3].(string)), &synapseSchema)
		if err != nil {
			return nil, err
		}

		dataType := getSynapseFieldType(synapseSchema.Type)
		schema = append(schema, data.Field{Name: row[2].(string), Type: dataType})
	}

	return schema, nil
}

func (sc SynapseApiClient) GetFieldValues(ctx context.Context, namespace string, tableName string, fieldName string) ([]any, error) {
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

func (sc SynapseApiClient) GetNamespaces(ctx context.Context) ([]string, error) {
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

func (sc SynapseApiClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
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

		rows = append(rows, convertSynapseRow(values))
	}

	return &data.QueryResults{
		Schema: convertSynapseSchema(columns),
		Data:   rows,
	}, nil
}

func (sc SynapseApiClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
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

	return &synapseIterator{
		queryResult: *queryResult,
		schema:      convertSynapseSchema(columns),
	}, nil
}

func convertSynapseRow(synapseRow []any) data.Row {
	row := make(data.Row, len(synapseRow))
	for i, value := range synapseRow {
		row[i] = convertSynapseValue(value)
	}

	return row
}

func convertSynapseValue(synapseValue any) any {
	// TODO: convert the values to the expected Fabra Golang types
	return synapseValue
}

func getSynapseFieldType(synapseType string) data.FieldType {
	switch synapseType {
	case "BIT", "BOOLEAN":
		return data.FieldTypeBoolean
	case "INTEGER", "BIGINT", "SMALLINT", "TINYINT":
		return data.FieldTypeInteger
	case "REAL", "DOUBLE", "DECIMAL", "NUMERIC", "FLOAT", "FIXED":
		return data.FieldTypeNumber
	case "TIMESTAMP_TZ":
		return data.FieldTypeDateTimeTz
	case "TIMESTAMP", "TIMESTAMP_NTZ":
		return data.FieldTypeDateTimeNtz
	default:
		// Everything can always be treated as a string
		return data.FieldTypeString
	}
}

func convertSynapseSchema(columns []*sql.ColumnType) data.Schema {
	schema := data.Schema{}

	for _, column := range columns {
		field := data.Field{
			Name: column.Name(),
			Type: getSynapseFieldType(column.DatabaseTypeName()),
		}

		schema = append(schema, field)
	}

	return schema
}
