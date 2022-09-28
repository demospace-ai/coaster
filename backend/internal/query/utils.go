package query

import "cloud.google.com/go/bigquery"

type Schema []ColumnSchema

type ColumnSchema struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Row []Value
type Value interface{}

type Error struct {
	err error
}

func NewError(err error) error {
	return Error{err: err}
}

func (e Error) Error() string {
	return e.err.Error()
}

func ConvertBigQuerySchema(bigQuerySchema bigquery.Schema) Schema {
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
