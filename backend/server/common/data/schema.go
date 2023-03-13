package data

import (
	"errors"

	"cloud.google.com/go/bigquery"
)

type Schema []Field

type FieldType string

const (
	FieldTypeString       FieldType = "STRING"
	FieldTypeInteger      FieldType = "INTEGER"
	FieldTypeNumber       FieldType = "NUMBER"
	FieldTypeTimestampTz  FieldType = "TIMESTAMP_TZ"
	FieldTypeTimestampNtz FieldType = "TIMESTAMP_NTZ"
	FieldTypeTimeTz       FieldType = "TIME_TZ"
	FieldTypeTimeNtz      FieldType = "TIME_NTZ"
	FieldTypeDate         FieldType = "DATE"
	FieldTypeDateTime     FieldType = "DATETIME"
	FieldTypeBoolean      FieldType = "BOOLEAN"
	FieldTypeArray        FieldType = "ARRAY"
	FieldTypeJson         FieldType = "JSON"
)

func (ct FieldType) ToBigQueryType() bigquery.FieldType {
	switch ct {
	case FieldTypeInteger:
		return bigquery.IntegerFieldType
	case FieldTypeNumber:
		return bigquery.NumericFieldType
	case FieldTypeBoolean:
		return bigquery.BooleanFieldType
	case FieldTypeTimestampTz, FieldTypeTimestampNtz:
		return bigquery.TimestampFieldType
	case FieldTypeJson:
		return bigquery.JSONFieldType
	case FieldTypeDate:
		return bigquery.DateFieldType
	case FieldTypeTimeTz, FieldTypeTimeNtz:
		return bigquery.TimeFieldType
	case FieldTypeDateTime:
		return bigquery.DateTimeFieldType
	default:
		return bigquery.StringFieldType
	}
}

type Field struct {
	Name string    `json:"name"`
	Type FieldType `json:"type"`
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
