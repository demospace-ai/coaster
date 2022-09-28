package test

import (
	"fabra/internal/models"
	"fabra/internal/query"
)

type MockCryptoService struct {
}

func (cs MockCryptoService) DecryptDataConnectionCredentials(_ string) (*string, error) {
	result := "decrypted"
	return &result, nil
}

func (cs MockCryptoService) EncryptDataConnectionCredentials(_ string) (*string, error) {
	result := "encrypted"
	return &result, nil
}

type MockQueryService struct {
}

func (qs MockQueryService) GetEvents(dataConnection models.DataConnection, eventSet models.EventSet) ([]string, error) {
	result := []string{"decrypted"}
	return result, nil
}

func (qs MockQueryService) RunQuery(dataConnection models.DataConnection, queryString string) (query.Schema, []query.Row, error) {
	schema := query.Schema{
		query.ColumnSchema{Name: "Column 1", Type: "string"},
		query.ColumnSchema{Name: "Column 2", Type: "number"},
	}

	rows := []query.Row{
		{"value1", "value2"},
	}

	return schema, rows, nil
}
