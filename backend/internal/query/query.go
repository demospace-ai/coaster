package query

import (
	"context"
	"encoding/json"
	"fabra/internal/crypto"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fmt"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type QueryService struct {
	cryptoService crypto.CryptoService
}

func NewQueryService(cryptoService crypto.CryptoService) QueryService {
	return QueryService{
		cryptoService: cryptoService,
	}
}

func NewError(err error) error {
	return Error{err: err}
}

func (e Error) Error() string {
	return e.err.Error()
}

func (qs QueryService) GetEvents(dataConnection models.DataConnection, eventSet models.EventSet) ([]string, error) {
	queryString, err := createGetEventsQuery(eventSet)
	if err != nil {
		return nil, err
	}

	_, results, err := qs.RunQuery(dataConnection, queryString)
	if err != nil {
		return nil, err
	}

	events := []string{}
	for _, row := range results {
		events = append(events, row[0].(string))
	}

	return events, nil
}

func (qs QueryService) RunQuery(dataConnection models.DataConnection, queryString string) (Schema, []Row, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return qs.runBigQueryQuery(dataConnection, queryString)
	case models.DataConnectionTypeSnowflake:
		return qs.runSnowflakeQuery(dataConnection, queryString)
	default:
		return nil, nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func createGetEventsQuery(eventSet models.EventSet) (string, error) {
	if eventSet.CustomJoin.Valid {
		return "WITH custom_events AS (" +
			eventSet.CustomJoin.String +
			")" +
			"SELECT DISTINCT " + eventSet.EventTypeColumn + " FROM custom_events", nil
	}

	if eventSet.DatasetName.Valid && eventSet.TableName.Valid {
		return "SELECT DISTINCT " + eventSet.EventTypeColumn + " FROM " + eventSet.DatasetName.String + "." + eventSet.TableName.String, nil
	}

	return "", errors.Newf("bad event set: %v", eventSet)
}

func (qs QueryService) runBigQueryQuery(dataConnection models.DataConnection, queryString string) (Schema, []Row, error) {
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

	var results []Row
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

func bigQueryRowtoRow(bigQueryRow []bigquery.Value) Row {
	var row Row
	for _, value := range bigQueryRow {
		row = append(row, Value(value))
	}

	return row
}

func (qs QueryService) runSnowflakeQuery(dataConnection models.DataConnection, queryString string) (Schema, []Row, error) {
	// TODO: implement
	return nil, nil, errors.NewBadRequest("snowflake not supported")
}
