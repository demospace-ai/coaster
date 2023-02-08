package query

import (
	"context"
	"fabra/internal/crypto"
	"fabra/internal/models"

	"gorm.io/gorm"
)

type QueryService interface {
	GetDatasets(ctx context.Context, dataConnection *models.Connection) ([]string, error)
	GetTables(ctx context.Context, dataConnection *models.Connection, datasetName string) ([]string, error)
	GetTableSchema(ctx context.Context, dataConnection *models.Connection, datasetName string, tableName string) ([]ColumnSchema, error)
	GetColumnValues(ctx context.Context, dataConnection *models.Connection, datasetName string, tableName string, columnName string) ([]Value, error)
	RunQuery(ctx context.Context, dataConnection *models.Connection, queryString string) (*QueryResult, error)
}

type QueryServiceImpl struct {
	db            *gorm.DB
	cryptoService crypto.CryptoService
}

func NewQueryService(db *gorm.DB, cryptoService crypto.CryptoService) QueryService {
	return QueryServiceImpl{
		db:            db,
		cryptoService: cryptoService,
	}
}

func (qs QueryServiceImpl) RunQuery(ctx context.Context, dataConnection *models.Connection, queryString string) (*QueryResult, error) {
	client, err := qs.newAPIClient(ctx, dataConnection)
	if err != nil {
		return nil, err
	}

	return client.RunQuery(ctx, queryString)
}

func (qs QueryServiceImpl) GetDatasets(ctx context.Context, dataConnection *models.Connection) ([]string, error) {
	client, err := qs.newAPIClient(ctx, dataConnection)
	if err != nil {
		return nil, err
	}

	return client.GetDatasets(ctx)
}

func (qs QueryServiceImpl) GetTables(ctx context.Context, dataConnection *models.Connection, datasetName string) ([]string, error) {
	client, err := qs.newAPIClient(ctx, dataConnection)
	if err != nil {
		return nil, err
	}

	return client.GetTables(ctx, datasetName)
}

func (qs QueryServiceImpl) GetTableSchema(ctx context.Context, dataConnection *models.Connection, datasetName string, tableName string) ([]ColumnSchema, error) {
	client, err := qs.newAPIClient(ctx, dataConnection)
	if err != nil {
		return nil, err
	}

	return client.GetTableSchema(ctx, datasetName, tableName)
}

func (qs QueryServiceImpl) GetColumnValues(ctx context.Context, dataConnection *models.Connection, datasetName string, tableName string, columnName string) ([]Value, error) {
	client, err := qs.newAPIClient(ctx, dataConnection)
	if err != nil {
		return nil, err
	}

	return client.GetColumnValues(ctx, datasetName, tableName, columnName)
}
