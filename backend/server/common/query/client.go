package query

import (
	"context"
	"encoding/json"
	"errors"

	"go.fabra.io/server/common/models"
)

type apiClient interface {
	GetTables(ctx context.Context, namespace string) ([]string, error)
	GetTableSchema(ctx context.Context, namespace string, tableName string) (Schema, error)
	GetNamespaces(ctx context.Context) ([]string, error)
	GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]Value, error)
	RunQuery(ctx context.Context, queryString string) (*QueryResult, error)
	GetQueryIterator(ctx context.Context, queryString string) (RowIterator, error)
}

func (qs QueryServiceImpl) newAPIClient(ctx context.Context, connection *models.Connection) (apiClient, error) {
	switch connection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		bigQueryCredentialsString, err := qs.cryptoService.DecryptConnectionCredentials(connection.Credentials.String)
		if err != nil {
			return nil, err
		}

		var bigQueryCredentials models.BigQueryCredentials
		err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
		if err != nil {
			return nil, err
		}

		if !connection.Location.Valid {
			return nil, errors.New("bigquery connection must have location defined")
		}

		return BigQueryApiClient{
			ProjectID:   &bigQueryCredentials.ProjectID,
			Credentials: bigQueryCredentialsString,
			Location:    &connection.Location.String,
		}, nil
	default:
		return nil, errors.New("unrecognized warehouse type")
	}
}
