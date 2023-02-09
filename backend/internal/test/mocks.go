package test

import (
	"context"
	"fabra/internal/models"
	"fabra/internal/query"

	"gorm.io/gorm"
)

type MockCryptoService struct {
}

func (cs MockCryptoService) DecryptConnectionCredentials(_ string) (*string, error) {
	result := "decrypted"
	return &result, nil
}

func (cs MockCryptoService) EncryptConnectionCredentials(_ string) (*string, error) {
	result := "encrypted"
	return &result, nil
}

func (cs MockCryptoService) DecryptApiKey(_ string) (*string, error) {
	result := "decrypted"
	return &result, nil
}

func (cs MockCryptoService) EncryptApiKey(_ string) (*string, error) {
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

func (qs MockQueryService) GetDatasets(ctx context.Context, dataConnection *models.Connection) ([]string, error) {
	return nil, nil
}

func (qs MockQueryService) GetTables(ctx context.Context, dataConnection *models.Connection, datasetName string) ([]string, error) {
	return nil, nil
}

func (qs MockQueryService) GetTableSchema(ctx context.Context, dataConnection *models.Connection, datasetName string, tableName string) ([]query.ColumnSchema, error) {
	return nil, nil
}

func (qs MockQueryService) GetColumnValues(ctx context.Context, dataConnection *models.Connection, datasetName string, tableName string, columnName string) ([]query.Value, error) {
	return nil, nil
}

func (qs MockQueryService) RunQuery(ctx context.Context, dataConnection *models.Connection, queryString string) (*query.QueryResult, error) {
	return nil, nil
}
