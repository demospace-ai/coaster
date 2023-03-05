package data

import "errors"

type Schema []ColumnSchema

type ColumnType string

const (
	ColumnTypeString       ColumnType = "STRING"
	ColumnTypeInteger      ColumnType = "INTEGER"
	ColumnTypeNumber       ColumnType = "NUMBER"
	ColumnTypeJson         ColumnType = "JSON"
	ColumnTypeTimestampTz  ColumnType = "TIMESTAMP_TZ"
	ColumnTypeTimestampNtz ColumnType = "TIMESTAMP_NTZ"
	ColumnTypeDate         ColumnType = "DATE"
	ColumnTypeTime         ColumnType = "TIME"
	ColumnTypeDateTime     ColumnType = "DATETIME"
	ColumnTypeBoolean      ColumnType = "BOOLEAN"
	ColumnTypeArray        ColumnType = "ARRAY"
)

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
