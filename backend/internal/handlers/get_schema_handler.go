package handlers

import (
	"context"
	"encoding/json"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/option"
)

type GetSchemaResponse struct {
	Schema dataconnections.Schema `json:"schema"`
}

func GetSchema(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	if env.Auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetSchema request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return nil
	}

	datasetID := r.URL.Query().Get("datasetID")
	tableName := r.URL.Query().Get("tableName")
	customJoin := r.URL.Query().Get("customJoin")
	if (len(datasetID) == 0 || len(tableName) == 0) && len(customJoin) == 0 {
		return fmt.Errorf("must provide both dataset name and table name or custom join in GetSchema request: %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(env.Db, connectionID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	var schema *dataconnections.Schema
	if len(customJoin) > 0 {
		schema, err = getSchemaForCustomJoin(*dataConnection, customJoin)
		if err != nil {
			return err
		}
	} else {
		schema, err = getSchemaForTable(*dataConnection, datasetID, tableName)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: *schema,
	})
}

func getSchemaForTable(dataConnection models.DataConnection, datasetID string, tableName string) (*dataconnections.Schema, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return getBigQuerySchemaForTable(dataConnection, datasetID, tableName)
	case models.DataConnectionTypeSnowflake:
		return getSnowflakeSchemaForTable(dataConnection, datasetID, tableName)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func getSchemaForCustomJoin(dataConnection models.DataConnection, customJoin string) (*dataconnections.Schema, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return getBigQuerySchemaForCustom(dataConnection, customJoin)
	case models.DataConnectionTypeSnowflake:
		return getSnowflakeSchemaForCustom(dataConnection, customJoin)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func getBigQuerySchemaForCustom(dataConnection models.DataConnection, customJoin string) (*dataconnections.Schema, error) {
	bigQueryCredentialsString, err := dataconnections.DecryptBigQueryCredentials(dataConnection)
	if err != nil {
		return nil, err
	}

	var bigQueryCredentials models.BigQueryCredentials
	err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
	if err != nil {
		return nil, err
	}

	credentialOption := option.WithCredentialsJSON([]byte(*bigQueryCredentialsString))

	ctx := context.Background()
	client, err := bigquery.NewClient(ctx, bigQueryCredentials.ProjectID, credentialOption)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Close()

	// Make sure there is no trailing semicolon, and limit to 1 since we only care about the schema
	queryString := customJoin
	queryString = strings.TrimRight(queryString, ";")
	queryString = queryString + " LIMIT 1"

	q := client.Query(queryString)
	// Location must match that of the dataset(s) referenced in the query.
	q.Location = "US"
	// Run the query and print results when the query job is completed.
	job, err := q.Run(ctx)
	if err != nil {
		return nil, err
	}
	status, err := job.Wait(ctx)
	if err != nil {
		return nil, QueryError{err}
	}
	if err := status.Err(); err != nil {
		return nil, QueryError{err}
	}

	it, err := job.Read(ctx)
	if err != nil {
		return nil, err
	}

	schema := dataconnections.ConvertBigQuerySchema(it.Schema)

	return &schema, nil
}

func getBigQuerySchemaForTable(dataConnection models.DataConnection, datasetID string, tableName string) (*dataconnections.Schema, error) {
	bigQueryCredentialsString, err := dataconnections.DecryptBigQueryCredentials(dataConnection)
	if err != nil {
		return nil, err
	}

	var bigQueryCredentials models.BigQueryCredentials
	err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
	if err != nil {
		return nil, err
	}

	credentialOption := option.WithCredentialsJSON([]byte(*bigQueryCredentialsString))

	ctx := context.Background()
	client, err := bigquery.NewClient(ctx, bigQueryCredentials.ProjectID, credentialOption)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Close()

	metadata, err := client.Dataset(datasetID).Table(tableName).Metadata(ctx)
	if err != nil {
		return nil, err
	}

	schema := dataconnections.ConvertBigQuerySchema(metadata.Schema)

	return &schema, nil
}

func getSnowflakeSchemaForTable(dataConnection models.DataConnection, datasetID string, tableName string) (*dataconnections.Schema, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}

func getSnowflakeSchemaForCustom(dataConnection models.DataConnection, customJoin string) (*dataconnections.Schema, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}
