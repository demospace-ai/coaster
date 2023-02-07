package query

import (
	"bytes"
	"text/template"
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

func createCustomTableQuery(customJoin string) string {
	return "WITH custom_events AS (" + customJoin + ")"
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
