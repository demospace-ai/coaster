package api

import (
	"context"
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fmt"
	"net/http"
	"strconv"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type GetTablesResponse struct {
	Tables []string `json:"tables"`
}

func (s ApiService) GetTables(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetDatasets request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return nil
	}

	datasetID := r.URL.Query().Get("datasetID")
	if len(datasetID) == 0 {
		return fmt.Errorf("missing dataset ID from GetTables request URL: %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	tables, err := s.getTables(*dataConnection, datasetID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetTablesResponse{
		Tables: tables,
	})
}

func (s ApiService) getTables(dataConnection models.DataConnection, datasetID string) ([]string, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return s.getBigQueryTables(dataConnection, datasetID)
	case models.DataConnectionTypeSnowflake:
		return s.getSnowflakeTables(dataConnection, datasetID)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func (s ApiService) getBigQueryTables(dataConnection models.DataConnection, datasetID string) ([]string, error) {
	bigQueryCredentialsString, err := s.cryptoService.DecryptDataConnectionCredentials(dataConnection.Credentials.String)
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

	ts := client.Dataset(datasetID).Tables(ctx)
	var results []string
	for {
		table, err := ts.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		results = append(results, table.TableID)
	}

	return results, nil
}

func (s ApiService) getSnowflakeTables(dataConnection models.DataConnection, datasetID string) ([]string, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}
