package query

import (
	"context"
	"encoding/json"
	"fabra/internal/crypto"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/views"
	"fmt"

	"github.com/fabra-io/go-sdk/fabra"
	"gorm.io/gorm"
)

type QueryService interface {
	GetEvents(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]string, error)
	GetProperties(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]views.PropertyGroup, error)
	GetPropertyValues(dataConnection *models.DataConnection, eventSet *models.EventSet, propertyName string) ([]fabra.Value, error)
	RunFunnelQuery(analysis *models.Analysis) (*fabra.QueryResult, error)
	RunCustomQuery(analysis *models.Analysis) (*fabra.QueryResult, error)
	RunTrendQuery(analysis *models.Analysis) ([]fabra.QueryResult, error)
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

func (qs QueryServiceImpl) runQuery(dataConnection *models.DataConnection, queryString string) (*fabra.QueryResult, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return qs.runBigQueryQuery(dataConnection, queryString)
	case models.DataConnectionTypeSnowflake:
		return qs.runSnowflakeQuery(dataConnection, queryString)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func (qs QueryServiceImpl) runBigQueryQuery(dataConnection *models.DataConnection, queryString string) (*fabra.QueryResult, error) {
	ctx := context.Background()
	bigQueryCredentialsString, err := qs.cryptoService.DecryptDataConnectionCredentials(dataConnection.Credentials.String)
	if err != nil {
		return nil, err
	}

	var bigQueryCredentials models.BigQueryCredentials
	err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
	if err != nil {
		return nil, err
	}

	client, err := fabra.NewAPIClient(
		fabra.WarehouseType(dataConnection.ConnectionType),
		map[string]interface{}{
			fabra.GCPProjectID:   &bigQueryCredentials.ProjectID,
			fabra.GCPCredentials: bigQueryCredentialsString,
		},
	)
	if err != nil {
		return nil, err
	}

	return client.RunQuery(ctx, queryString)
}

func (qs QueryServiceImpl) runSnowflakeQuery(dataConnection *models.DataConnection, queryString string) (*fabra.QueryResult, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}
