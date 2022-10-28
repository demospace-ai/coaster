package query

import (
	"context"
	"encoding/json"
	"fabra/internal/crypto"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/views"
	"fmt"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
	"gorm.io/gorm"
)

type QueryService interface {
	GetEvents(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]string, error)
	GetProperties(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]views.PropertyGroup, error)
	GetPropertyValues(dataConnection *models.DataConnection, eventSet *models.EventSet, propertyName string) ([]views.Value, error)
	RunFunnelQuery(analysis *models.Analysis) (views.Schema, []views.Row, error)
	RunCustomQuery(analysis *models.Analysis) (views.Schema, []views.Row, error)
	GetTableSchema(dataConnection *models.DataConnection, datasetName string, tableName string) (views.Schema, error)
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

func (qs QueryServiceImpl) runQuery(dataConnection *models.DataConnection, queryString string) (views.Schema, []views.Row, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return qs.runBigQueryQuery(dataConnection, queryString)
	case models.DataConnectionTypeSnowflake:
		return qs.runSnowflakeQuery(dataConnection, queryString)
	default:
		return nil, nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func (qs QueryServiceImpl) runBigQueryQuery(dataConnection *models.DataConnection, queryString string) (views.Schema, []views.Row, error) {
	bigQueryCredentialsString, err := qs.cryptoService.DecryptDataConnectionCredentials(dataConnection.Credentials.String)
	if err != nil {
		return nil, nil, err
	}

	var bigQueryCredentials models.BigQueryCredentials
	err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
	if err != nil {
		return nil, nil, err
	}

	credentialOption := option.WithCredentialsJSON([]byte(*bigQueryCredentialsString))

	ctx := context.Background()
	client, err := bigquery.NewClient(ctx, bigQueryCredentials.ProjectID, credentialOption)
	if err != nil {
		return nil, nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}
	defer client.Close()

	q := client.Query(queryString)
	// Location must match that of the dataset(s) referenced in the query.
	q.Location = "US"
	// Run the query and print results when the query job is completed.
	job, err := q.Run(ctx)
	if err != nil {
		return nil, nil, err
	}
	status, err := job.Wait(ctx)
	if err != nil {
		return nil, nil, NewError(err)
	}
	if err := status.Err(); err != nil {
		return nil, nil, NewError(err)
	}

	var results []views.Row
	it, err := job.Read(ctx)
	if err != nil {
		return nil, nil, err
	}

	for {
		var row []bigquery.Value
		err := it.Next(&row)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, nil, err
		}
		results = append(results, bigQueryRowtoRow(row))
	}

	return ConvertBigQuerySchema(it.Schema), results, nil
}

func bigQueryRowtoRow(bigQueryRow []bigquery.Value) views.Row {
	var row views.Row
	for _, value := range bigQueryRow {
		row = append(row, views.Value(value))
	}

	return row
}

func (qs QueryServiceImpl) runSnowflakeQuery(dataConnection *models.DataConnection, queryString string) (views.Schema, []views.Row, error) {
	// TODO: implement
	return nil, nil, errors.NewBadRequest("snowflake not supported")
}
