package query

import (
	"context"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

type QueryService interface {
	GetNamespaces(ctx context.Context, connection *models.Connection) ([]string, error)
	GetTables(ctx context.Context, connection *models.Connection, namespace string) ([]string, error)
	GetTableSchema(ctx context.Context, connection *models.Connection, namespace string, tableName string) ([]data.ColumnSchema, error)
	GetColumnValues(ctx context.Context, connection *models.Connection, namespace string, tableName string, columnName string) ([]any, error)
	RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*data.QueryResults, error)
	GetQueryIterator(ctx context.Context, connection *models.Connection, queryString string) (data.RowIterator, error)
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

func (qs QueryServiceImpl) RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*data.QueryResults, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.RunQuery(ctx, queryString)
}

func (qs QueryServiceImpl) GetQueryIterator(ctx context.Context, connection *models.Connection, queryString string) (data.RowIterator, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetQueryIterator(ctx, queryString)
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

func (qs QueryServiceImpl) GetTableSchema(ctx context.Context, connection *models.Connection, namespace string, tableName string) ([]data.ColumnSchema, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetTableSchema(ctx, namespace, tableName)
}

func (qs QueryServiceImpl) GetColumnValues(ctx context.Context, connection *models.Connection, namespace string, tableName string, columnName string) ([]any, error) {
	client, err := qs.newAPIClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetColumnValues(ctx, namespace, tableName, columnName)
}
