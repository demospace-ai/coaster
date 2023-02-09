package query

import (
	"context"
	"fabra/internal/crypto"
	"fabra/internal/models"

	"gorm.io/gorm"
)

type QueryService interface {
	GetNamespaces(ctx context.Context, connection *models.Connection) ([]string, error)
	GetTables(ctx context.Context, connection *models.Connection, namespace string) ([]string, error)
	GetTableSchema(ctx context.Context, connection *models.Connection, namespace string, tableName string) ([]ColumnSchema, error)
	GetColumnValues(ctx context.Context, connection *models.Connection, namespace string, tableName string, columnName string) ([]Value, error)
	RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*QueryResult, error)
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

func (qs QueryServiceImpl) RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*QueryResult, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.RunQuery(ctx, queryString)
}

func (qs QueryServiceImpl) GetNamespaces(ctx context.Context, connection *models.Connection) ([]string, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetNamespaces(ctx)
}

func (qs QueryServiceImpl) GetTables(ctx context.Context, connection *models.Connection, namespace string) ([]string, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetTables(ctx, namespace)
}

func (qs QueryServiceImpl) GetTableSchema(ctx context.Context, connection *models.Connection, namespace string, tableName string) ([]ColumnSchema, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetTableSchema(ctx, namespace, tableName)
}

func (qs QueryServiceImpl) GetColumnValues(ctx context.Context, connection *models.Connection, namespace string, tableName string, columnName string) ([]Value, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetColumnValues(ctx, namespace, tableName, columnName)
}
