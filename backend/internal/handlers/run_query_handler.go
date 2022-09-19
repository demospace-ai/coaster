package handlers

import (
	"context"
	"encoding/json"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type RunQueryRequest struct {
	ConnectionID int64  `json:"connection_id"`
	QueryString  string `json:"query_string"`
}

type QueryError struct {
	err error
}

func (e QueryError) Error() string {
	return e.err.Error()
}

type RunQueryResponse struct {
	Success      bool                   `json:"success"`
	ErrorMessage string                 `json:"error_message"`
	Schema       dataconnections.Schema `json:"schema"`
	QueryResults []interface{}          `json:"query_results"`
}

func RunQuery(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	if env.Auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var runQueryRequest RunQueryRequest
	err := decoder.Decode(&runQueryRequest)
	if err != nil {
		return err
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(env.Db, runQueryRequest.ConnectionID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	schema, queryResults, err := runQuery(*dataConnection, runQueryRequest.QueryString)
	if err != nil {
		if _, ok := err.(QueryError); ok {
			// Not actually a failure, the user's query was just wrong. Send the details back to them.
			return json.NewEncoder(w).Encode(RunQueryResponse{
				Success:      false,
				ErrorMessage: err.Error(),
			})
		} else {
			return err
		}
	}

	return json.NewEncoder(w).Encode(RunQueryResponse{
		Success:      true,
		Schema:       schema,
		QueryResults: queryResults,
	})
}

func runQuery(dataConnection models.DataConnection, queryString string) (dataconnections.Schema, []interface{}, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return runBigQueryQuery(dataConnection, queryString)
	case models.DataConnectionTypeSnowflake:
		return runSnowflakeQuery(dataConnection, queryString)
	default:
		return nil, nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func runBigQueryQuery(dataConnection models.DataConnection, queryString string) (dataconnections.Schema, []interface{}, error) {
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
		return nil, nil, QueryError{err}
	}
	if err := status.Err(); err != nil {
		return nil, nil, QueryError{err}
	}

	var results []interface{}
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
		results = append(results, row)
	}

	return dataconnections.ConvertBigQuerySchema(it.Schema), results, nil
}

func runSnowflakeQuery(dataConnection models.DataConnection, queryString string) (dataconnections.Schema, []interface{}, error) {
	// TODO: implement
	return nil, nil, errors.NewBadRequest("snowflake not supported")
}
