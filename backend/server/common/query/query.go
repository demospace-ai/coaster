package query

import (
	"context"
	"encoding/json"

	"cloud.google.com/go/bigquery"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

const FABRA_TIMESTAMP_TZ_FORMAT = "2006-01-02 15:04:05-07:00"
const FABRA_TIMESTAMP_NTZ_FORMAT = "2006-01-02 15:04:05"

type StagingOptions struct {
	Bucket string
	Object string
}

type LoadOptions struct {
	GcsReference   string
	BigQuerySchema bigquery.Schema
	WriteMode      bigquery.TableWriteDisposition
}

type QueryService interface {
	GetNamespaces(ctx context.Context, connection *models.Connection) ([]string, error)
	GetTables(ctx context.Context, connection *models.Connection, namespace string) ([]string, error)
	GetSchema(ctx context.Context, connection *models.Connection, namespace string, tableName string) ([]data.Field, error)
	GetFieldValues(ctx context.Context, connection *models.Connection, namespace string, tableName string, fieldName string) ([]any, error)
	RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*data.QueryResults, error)
	GetQueryIterator(ctx context.Context, connection *models.Connection, queryString string) (data.RowIterator, error)
	GetClient(ctx context.Context, connection *models.Connection) (ConnectorClient, error)
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

type ConnectorClient interface {
	GetTables(ctx context.Context, namespace string) ([]string, error)
	GetSchema(ctx context.Context, namespace string, tableName string) (data.Schema, error)
	GetNamespaces(ctx context.Context) ([]string, error)
	GetFieldValues(ctx context.Context, namespace string, tableName string, fieldName string) ([]any, error)
	RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error)
	GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error)
}

func (qs QueryServiceImpl) GetClient(ctx context.Context, connection *models.Connection) (ConnectorClient, error) {
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
	case models.ConnectionTypeRedshift:
		redshiftPassword, err := qs.cryptoService.DecryptConnectionCredentials(connection.Password.String)
		if err != nil {
			return nil, err
		}

		// TODO: validate all connection params
		return RedshiftApiClient{
			Username:     connection.Username.String,
			Password:     *redshiftPassword,
			DatabaseName: connection.DatabaseName.String,
			Host:         connection.Host.String,
		}, nil
	case models.ConnectionTypeSynapse:
		synapsePassword, err := qs.cryptoService.DecryptConnectionCredentials(connection.Password.String)
		if err != nil {
			return nil, err
		}

		// TODO: validate all connection params
		return SynapseApiClient{
			Username:     connection.Username.String,
			Password:     *synapsePassword,
			DatabaseName: connection.DatabaseName.String,
			Host:         connection.Host.String,
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
		return nil, errors.Newf("unrecognized warehouse type %v", connection.ConnectionType)
	}
}

func (qs QueryServiceImpl) RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*data.QueryResults, error) {
	client, err := qs.GetClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.RunQuery(ctx, queryString)
}

func (qs QueryServiceImpl) GetQueryIterator(ctx context.Context, connection *models.Connection, queryString string) (data.RowIterator, error) {
	client, err := qs.GetClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetQueryIterator(ctx, queryString)
}

func (qs QueryServiceImpl) GetNamespaces(ctx context.Context, connection *models.Connection) ([]string, error) {
	client, err := qs.GetClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetNamespaces(ctx)
}

func (qs QueryServiceImpl) GetTables(ctx context.Context, connection *models.Connection, namespace string) ([]string, error) {
	client, err := qs.GetClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetTables(ctx, namespace)
}

func (qs QueryServiceImpl) GetSchema(ctx context.Context, connection *models.Connection, namespace string, tableName string) ([]data.Field, error) {
	client, err := qs.GetClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetSchema(ctx, namespace, tableName)
}

func (qs QueryServiceImpl) GetFieldValues(ctx context.Context, connection *models.Connection, namespace string, tableName string, fieldName string) ([]any, error) {
	client, err := qs.GetClient(ctx, connection)
	if err != nil {
		return nil, err
	}

	return client.GetFieldValues(ctx, namespace, tableName, fieldName)
}
