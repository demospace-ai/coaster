package data

import (
	"errors"

	"cloud.google.com/go/bigquery"
)

type Schema []ColumnSchema

type ColumnType string

const (
	ColumnTypeString       ColumnType = "STRING"
	ColumnTypeInteger      ColumnType = "INTEGER"
	ColumnTypeNumber       ColumnType = "NUMBER"
	ColumnTypeTimestampTz  ColumnType = "TIMESTAMP_TZ"
	ColumnTypeTimestampNtz ColumnType = "TIMESTAMP_NTZ"
	ColumnTypeTimeTz       ColumnType = "TIME_TZ"
	ColumnTypeTimeNtz      ColumnType = "TIME_NTZ"
	ColumnTypeDate         ColumnType = "DATE"
	ColumnTypeDateTime     ColumnType = "DATETIME"
	ColumnTypeBoolean      ColumnType = "BOOLEAN"
	ColumnTypeArray        ColumnType = "ARRAY"
	ColumnTypeObject       ColumnType = "OBJECT"
)

func (ct ColumnType) ToBigQueryType() bigquery.FieldType {
	switch ct {
	case ColumnTypeInteger:
		return bigquery.IntegerFieldType
	case ColumnTypeNumber:
		return bigquery.NumericFieldType
	case ColumnTypeBoolean:
		return bigquery.BooleanFieldType
	case ColumnTypeTimestampTz, ColumnTypeTimestampNtz:
		return bigquery.TimestampFieldType
	case ColumnTypeObject:
		return bigquery.JSONFieldType
	case ColumnTypeDate:
		return bigquery.DateFieldType
	case ColumnTypeTimeTz, ColumnTypeTimeNtz:
		return bigquery.TimeFieldType
	case ColumnTypeDateTime:
		return bigquery.DateTimeFieldType
	default:
		return bigquery.StringFieldType
	}
}

type ColumnSchema struct {
	Name string     `json:"name"`
	Type ColumnType `json:"type"`
}

type Row []any

var ErrDone = errors.New("no more items in fabra iterator")

type RowIterator interface {
	Next() (Row, error)
	Schema() Schema
}

type QueryResults struct {
	Data   []Row  `json:"data"`
	Schema Schema `json:"schema"`
}
