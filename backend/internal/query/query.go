package query

import (
	"context"
	"encoding/json"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fmt"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type Schema []ColumnSchema

type ColumnSchema struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Row []Value
type Value interface{}

type Error struct {
	err error
}

func NewError(err error) error {
	return Error{err: err}
}

func (e Error) Error() string {
	return e.err.Error()
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

func GetEvents(dataConnection models.DataConnection, eventSet models.EventSet) ([]string, error) {
	queryString, err := createGetEventsQuery(eventSet)
	if err != nil {
		return nil, err
	}

	_, results, err := RunQuery(dataConnection, queryString)
	if err != nil {
		return nil, err
	}

	events := []string{}
	for _, row := range results {
		events = append(events, row[0].(string))
	}

	return events, nil
}

func RunQuery(dataConnection models.DataConnection, queryString string) (Schema, []Row, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return runBigQueryQuery(dataConnection, queryString)
	case models.DataConnectionTypeSnowflake:
		return runSnowflakeQuery(dataConnection, queryString)
	default:
		return nil, nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func runBigQueryQuery(dataConnection models.DataConnection, queryString string) (Schema, []Row, error) {
	bigQueryCredentialsString, err := dataconnections.DecryptBigQueryCredentials(dataConnection)
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

func ConvertBigQuerySchema(bigQuerySchema bigquery.Schema) Schema {
	schema := Schema{}

	for _, bigQuerySchemaField := range bigQuerySchema {
		columnSchema := ColumnSchema{
			Name: bigQuerySchemaField.Name,
			Type: string(bigQuerySchemaField.Type),
		}

		schema = append(schema, columnSchema)
	}

	return schema
}

func bigQueryRowtoRow(bigQueryRow []bigquery.Value) Row {
	var row Row
	for _, value := range bigQueryRow {
		row = append(row, Value(value))
	}

	return row
}

func runSnowflakeQuery(dataConnection models.DataConnection, queryString string) (Schema, []Row, error) {
	// TODO: implement
	return nil, nil, errors.NewBadRequest("snowflake not supported")
}
