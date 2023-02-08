package query

import (
	"context"
	"encoding/json"
	"errors"
	"fabra/internal/models"
)

type apiClient interface {
	GetTables(ctx context.Context, datasetName string) ([]string, error)
	GetTableSchema(ctx context.Context, datasetName string, tableName string) (Schema, error)
	GetDatasets(ctx context.Context) ([]string, error)
	GetColumnValues(ctx context.Context, datasetName string, tableName string, columnName string) ([]Value, error)
	RunQuery(ctx context.Context, queryString string) (*QueryResult, error)
}

func (qs QueryServiceImpl) newAPIClient(ctx context.Context, dataConnection *models.Connection) (apiClient, error) {
	switch dataConnection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		bigQueryCredentialsString, err := qs.cryptoService.DecryptConnectionCredentials(dataConnection.Credentials.String)
		if err != nil {
			return nil, err
		}

		var bigQueryCredentials models.BigQueryCredentials
		err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
		if err != nil {
			return nil, err
		}

		return BigQueryApiClient{
			GCPProjectID:   &bigQueryCredentials.ProjectID,
			GCPCredentials: bigQueryCredentialsString,
		}, nil
	default:
		return nil, errors.New("unrecognized warehouse type")
	}
}
