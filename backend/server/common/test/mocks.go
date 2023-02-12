package test

import (
	"context"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"

	"gorm.io/gorm"
)

type MockAuthService struct {
}

func (as MockAuthService) GetAuthentication(r *http.Request) (*auth.Authentication, error) {
	return nil, nil
}

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

func (qs MockQueryService) GetNamespaces(ctx context.Context, connection *models.Connection) ([]string, error) {
	return nil, nil
}

func (qs MockQueryService) GetTables(ctx context.Context, connection *models.Connection, namespace string) ([]string, error) {
	return nil, nil
}

func (qs MockQueryService) GetTableSchema(ctx context.Context, connection *models.Connection, namespace string, tableName string) ([]query.ColumnSchema, error) {
	return nil, nil
}

func (qs MockQueryService) GetColumnValues(ctx context.Context, connection *models.Connection, namespace string, tableName string, columnName string) ([]query.Value, error) {
	return nil, nil
}

func (qs MockQueryService) RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*query.QueryResult, error) {
	return nil, nil
}
