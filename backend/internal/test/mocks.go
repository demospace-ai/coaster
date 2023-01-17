package test

import (
	"fabra/internal/analyses"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"

	"github.com/fabra-io/go-sdk/fabra"
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

func (qs MockQueryService) RunCustomQuery(analysis *models.Analysis) (*fabra.QueryResult, error) {
	_, err := dataconnections.LoadDataConnectionByID(qs.db, analysis.OrganizationID, analysis.ConnectionID.Int64)
	if err != nil {
		return nil, err
	}

	schema := fabra.Schema{
		fabra.ColumnSchema{Name: "Column 1", Type: "string"},
		fabra.ColumnSchema{Name: "Column 2", Type: "number"},
	}

	rows := []fabra.Row{
		{"value1", "value2"},
	}

	result := fabra.QueryResult{
		Success: true,
		Schema:  schema,
		Data:    rows,
	}

	return &result, nil
}

func (qs MockQueryService) RunFunnelQuery(analysis *models.Analysis) (*fabra.QueryResult, error) {
	_, err := dataconnections.LoadDataConnectionByID(qs.db, analysis.OrganizationID, analysis.ConnectionID.Int64)
	if err != nil {
		return nil, err
	}

	_, err = eventsets.LoadEventSetByID(qs.db, analysis.OrganizationID, analysis.EventSetID.Int64)
	if err != nil {
		return nil, err
	}

	_, err = analyses.LoadEventsByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, err
	}

	schema := fabra.Schema{
		fabra.ColumnSchema{Name: "Column 1", Type: "string"},
		fabra.ColumnSchema{Name: "Column 2", Type: "number"},
	}

	rows := []fabra.Row{
		{"value1", "value2"},
	}

	result := fabra.QueryResult{
		Success: true,
		Schema:  schema,
		Data:    rows,
	}

	return &result, nil
}

func (qs MockQueryService) RunTrendQuery(analysis *models.Analysis) ([]fabra.QueryResult, error) {
	_, err := dataconnections.LoadDataConnectionByID(qs.db, analysis.OrganizationID, analysis.ConnectionID.Int64)
	if err != nil {
		return nil, err
	}

	_, err = eventsets.LoadEventSetByID(qs.db, analysis.OrganizationID, analysis.EventSetID.Int64)
	if err != nil {
		return nil, err
	}

	_, err = analyses.LoadEventsByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (qs MockQueryService) GetProperties(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]views.PropertyGroup, error) {
	return nil, nil
}

func (qs MockQueryService) GetPropertyValues(dataConnection *models.DataConnection, eventSet *models.EventSet, propertyName string) ([]fabra.Value, error) {
	return nil, nil
}

func (qs MockQueryService) GetTableSchema(dataConnection *models.DataConnection, datasetName string, tableName string) (fabra.Schema, error) {
	return nil, nil
}
