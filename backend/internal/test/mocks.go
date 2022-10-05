package test

import (
	"fabra/internal/analyses"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"

	"gorm.io/gorm"
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
	db *gorm.DB
}

func NewMockQueryService(db *gorm.DB) MockQueryService {
	return MockQueryService{
		db: db,
	}
}

func (qs MockQueryService) GetEvents(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]string, error) {
	result := []string{"decrypted"}
	return result, nil
}

func (qs MockQueryService) RunQuery(dataConnection *models.DataConnection, queryString string) (views.Schema, []views.Row, error) {
	schema := views.Schema{
		views.ColumnSchema{Name: "Column 1", Type: "string"},
		views.ColumnSchema{Name: "Column 2", Type: "number"},
	}

	rows := []views.Row{
		{"value1", "value2"},
	}

	return schema, rows, nil
}

func (qs MockQueryService) RunFunnelQuery(dataConnection *models.DataConnection, analysis *models.Analysis) (views.Schema, []views.Row, error) {
	_, err := eventsets.LoadEventSetByID(qs.db, analysis.OrganizationID, analysis.EventSetID.Int64)
	if err != nil {
		return nil, nil, err
	}

	_, err = analyses.LoadFunnelStepsByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, nil, err
	}

	schema := views.Schema{
		views.ColumnSchema{Name: "Column 1", Type: "string"},
		views.ColumnSchema{Name: "Column 2", Type: "number"},
	}

	rows := []views.Row{
		{"value1", "value2"},
	}

	return schema, rows, nil
}

func (qs MockQueryService) GetProperties(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]views.PropertyGroup, error) {
	return nil, nil
}

func (qs MockQueryService) GetPropertyValues(dataConnection *models.DataConnection, eventSet *models.EventSet, propertyName string) ([]views.Value, error) {
	return nil, nil
}
