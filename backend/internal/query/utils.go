package query

import (
	"bytes"
	"fabra/internal/models"
	"fabra/internal/views"
	"text/template"

	"cloud.google.com/go/bigquery"
)

type Error struct {
	err error
}

func NewError(err error) error {
	return Error{err: err}
}

func (e Error) Error() string {
	return e.err.Error()
}

func createCustomTableQuery(eventSet *models.EventSet) string {
	return "WITH custom_events AS (" + eventSet.CustomJoin.String + ")"
}

func executeTemplate(tmpl *template.Template, args map[string]interface{}) (*string, error) {
	var resultBytes bytes.Buffer
	err := tmpl.Execute(&resultBytes, args)
	if err != nil {
		return nil, err
	}

	result := resultBytes.String()
	return &result, nil
}

func ConvertBigQuerySchema(bigQuerySchema bigquery.Schema) views.Schema {
	schema := views.Schema{}

	for _, bigQuerySchemaField := range bigQuerySchema {
		columnSchema := views.ColumnSchema{
			Name: bigQuerySchemaField.Name,
			Type: string(bigQuerySchemaField.Type),
		}

		schema = append(schema, columnSchema)
	}

	return schema
}
