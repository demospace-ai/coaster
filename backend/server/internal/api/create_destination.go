package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/destinations"
	"go.fabra.io/server/common/views"
)

type CreateDestinationRequest struct {
	DisplayName     string                 `json:"display_name"`
	ConnectionType  models.ConnectionType  `json:"connection_type"`
	BigQueryConfig  *input.BigQueryConfig  `json:"bigquery_config,omitempty"`
	SnowflakeConfig *input.SnowflakeConfig `json:"snowflake_config,omitempty"`
}

type CreateDestinationResponse struct {
	Destination views.Destination
}

func (s ApiService) CreateDestination(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createDestinationRequest CreateDestinationRequest
	err := decoder.Decode(&createDestinationRequest)
	if err != nil {
		return err
	}

	err = validateCreateDestinationRequest(createDestinationRequest)
	if err != nil {
		return err
	}

	// TODO: Create connection + destination in a transaction
	var connection *models.Connection
	var encryptedCredentials *string
	switch createDestinationRequest.ConnectionType {
	case models.ConnectionTypeBigQuery:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createDestinationRequest.BigQueryConfig.Credentials)
		if err != nil {
			return err
		}
		connection, err = connections.CreateBigQueryConnection(
			s.db, auth.Organization.ID, *encryptedCredentials, createDestinationRequest.BigQueryConfig.Location,
		)
	case models.ConnectionTypeSnowflake:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createDestinationRequest.SnowflakeConfig.Password)
		if err != nil {
			return err
		}
		connection, err = connections.CreateSnowflakeConnection(
			s.db, auth.Organization.ID,
			*createDestinationRequest.SnowflakeConfig,
			*encryptedCredentials,
		)
	}

	if err != nil {
		return err
	}

	destination, err := destinations.CreateDestination(
		s.db,
		auth.Organization.ID,
		createDestinationRequest.DisplayName,
		connection.ID,
	)
	if err != nil {
		return err
	}

	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateDestinationResponse{
		views.ConvertDestination(*destination, *connection),
	})
}

func validateCreateDestinationRequest(request CreateDestinationRequest) error {
	switch request.ConnectionType {
	case models.ConnectionTypeBigQuery:
		return validateCreateBigQueryDestination(request)
	case models.ConnectionTypeSnowflake:
		return validateCreateSnowflakeDestination(request)
	default:
		return errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", request.ConnectionType))
	}
}

func validateCreateBigQueryDestination(request CreateDestinationRequest) error {
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

func validateCreateSnowflakeDestination(request CreateDestinationRequest) error {
	if request.SnowflakeConfig == nil {
		return errors.NewBadRequest("missing Snowflake configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}
