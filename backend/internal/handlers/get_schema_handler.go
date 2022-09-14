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
	if len(datasetID) == 0 {
		return fmt.Errorf("missing dataset ID from GetSchema request URL: %s", r.URL.RequestURI())
	}

	tableName := r.URL.Query().Get("tableName")
	if len(tableName) == 0 {
		return fmt.Errorf("missing table name from GetSchema request URL: %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(env.Db, connectionID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	schema, err := getSchema(*dataConnection, datasetID, tableName)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: *schema,
	})
}

func getSchema(dataConnection models.DataConnection, datasetID string, tableName string) (*dataconnections.Schema, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return getBigQuerySchema(dataConnection, datasetID, tableName)
	case models.DataConnectionTypeSnowflake:
		return getSnowflakeSchema(dataConnection, datasetID, tableName)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func getBigQuerySchema(dataConnection models.DataConnection, datasetID string, tableName string) (*dataconnections.Schema, error) {
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

func getSnowflakeSchema(dataConnection models.DataConnection, datasetID string, tableName string) (*dataconnections.Schema, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}
