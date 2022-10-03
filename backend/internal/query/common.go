package query

import (
	"bytes"
	"fabra/internal/models"
	"text/template"
)

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
