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

type GetDatasetsRequest struct {
	ConnectionID int64 `json:"connection_id,omitempty"`
}

type GetDatasetsResponse struct {
	Datasets []string `json:"datasets"`
}

func (s ApiService) GetDatasets(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

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

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	datasets, err := s.getDatasets(*dataConnection)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetDatasetsResponse{
		Datasets: datasets,
	})
}

func (s ApiService) getDatasets(dataConnection models.DataConnection) ([]string, error) {
	switch dataConnection.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return s.getBigQueryDatasets(dataConnection)
	case models.DataConnectionTypeSnowflake:
		return s.getSnowflakeDatasets(dataConnection)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", dataConnection.ConnectionType))
	}
}

func (s ApiService) getBigQueryDatasets(dataConnection models.DataConnection) ([]string, error) {
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

	ts := client.Datasets(ctx)
	var results []string
	for {
		dataset, err := ts.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		results = append(results, dataset.DatasetID)
	}

	return results, nil
}

func (s ApiService) getSnowflakeDatasets(dataConnection models.DataConnection) ([]string, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}
