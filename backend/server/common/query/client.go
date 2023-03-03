package query

import (
	"context"
	"encoding/json"
	"errors"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/models"
)

type apiClient interface {
	GetTables(ctx context.Context, namespace string) ([]string, error)
	GetTableSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error)
	GetNamespaces(ctx context.Context) ([]string, error)
	GetColumnValues(ctx context.Context, namespace string, tableName string, columnName string) ([]data.Value, error)
	RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error)
	GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error)
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
	case models.ConnectionTypeSnowflake:
		snowflakePassword, err := qs.cryptoService.DecryptConnectionCredentials(connection.Password.String)
		if err != nil {
			return nil, err
		}

		// TODO: validate all connection params
		return SnowflakeApiClient{
			Username:      connection.Username.String,
			Password:      *snowflakePassword,
			WarehouseName: connection.WarehouseName.String,
			DatabaseName:  connection.DatabaseName.String,
			Role:          connection.Role.String,
			Host:          connection.Host.String,
		}, nil
	case models.ConnectionTypeMongoDb:
		mongodbPassword, err := qs.cryptoService.DecryptConnectionCredentials(connection.Password.String)
		if err != nil {
			return nil, err
		}

		// TODO: validate all connection params
		return MongoDbApiClient{
			Username:          connection.Username.String,
			Password:          *mongodbPassword,
			Host:              connection.Host.String,
			ConnectionOptions: connection.ConnectionOptions.String,
		}, nil
	default:
		return nil, errors.New("unrecognized warehouse type")
	}
}
