package api

import (
	"context"
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type TestDataConnectionRequest struct {
	DisplayName    string                    `json:"display_name"`
	ConnectionType models.DataConnectionType `json:"connection_type"`
	Username       *string                   `json:"username,omitempty"`
	Password       *string                   `json:"password,omitempty"`
	Credentials    *string                   `json:"credentials,omitempty"`
	WarehouseName  *string                   `json:"warehouse_name,omitempty"`
	DatabaseName   *string                   `json:"database_name,omitempty"`
	Role           *string                   `json:"role,omitempty"`
	Account        *string                   `json:"account,omitempty"`
}

func (s ApiService) TestDataConnection(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createDataConnectionRequest CreateDataConnectionRequest
	err := decoder.Decode(&createDataConnectionRequest)
	if err != nil {
		return err
	}

	err = validateCreateDataConnectionRequest(createDataConnectionRequest)
	if err != nil {
		return err
	}

	switch createDataConnectionRequest.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return testBigQueryConnection(*createDataConnectionRequest.Credentials)
	case models.DataConnectionTypeSnowflake:
		// TODO: implement test for Snowflake
		return nil
	}

	return nil
}

func testBigQueryConnection(credentials string) error {
	var bigQueryCredentials models.BigQueryCredentials
	err := json.Unmarshal([]byte(credentials), &bigQueryCredentials)
	if err != nil {
		return err
	}

	credentialOption := option.WithCredentialsJSON([]byte(credentials))

	ctx := context.Background()
	client, err := bigquery.NewClient(ctx, bigQueryCredentials.ProjectID, credentialOption)
	if err != nil {
		return fmt.Errorf("bigquery.NewClient: %v", err)
	}
	defer client.Close()

	it := client.Datasets(ctx)
	_, err = it.Next()

	if err != nil && err != iterator.Done {
		return err
	}

	return nil
}
