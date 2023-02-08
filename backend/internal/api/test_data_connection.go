package api

import (
	"context"
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/input"
	"fabra/internal/models"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type TestDataConnectionRequest struct {
	DisplayName     string                 `json:"display_name"`
	ConnectionType  models.ConnectionType  `json:"connection_type"`
	BigQueryConfig  *input.BigQueryConfig  `json:"bigquery_config,omitempty"`
	SnowflakeConfig *input.SnowflakeConfig `json:"snowflake_config,omitempty"`
}

func (s ApiService) TestDataConnection(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var testDataConnectionRequest TestDataConnectionRequest
	err := decoder.Decode(&testDataConnectionRequest)
	if err != nil {
		return err
	}

	err = validateTestDataConnectionRequest(testDataConnectionRequest)
	if err != nil {
		return err
	}

	switch testDataConnectionRequest.ConnectionType {
	case models.ConnectionTypeBigQuery:
		return testBigQueryConnection(testDataConnectionRequest.BigQueryConfig.Credentials)
	case models.ConnectionTypeSnowflake:
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

func validateTestDataConnectionRequest(request TestDataConnectionRequest) error {
	switch request.ConnectionType {
	case models.ConnectionTypeBigQuery:
		return validateTestBigQueryConnection(request)
	case models.ConnectionTypeSnowflake:
		return validateTestSnowflakeConnection(request)
	default:
		return errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", request.ConnectionType))
	}
}

func validateTestBigQueryConnection(request TestDataConnectionRequest) error {
	if request.BigQueryConfig == nil {
		return errors.NewBadRequest("missing BigQuery configuration")
	}

	var bigQueryCredentials models.BigQueryCredentials
	err := json.Unmarshal([]byte(request.BigQueryConfig.Credentials), &bigQueryCredentials)
	if err != nil {
		return err
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateTestSnowflakeConnection(request TestDataConnectionRequest) error {
	if request.SnowflakeConfig == nil {
		return errors.NewBadRequest("missing Snowflake configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}
