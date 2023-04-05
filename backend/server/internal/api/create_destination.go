package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
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
	StagingBucket   *string                `json:"staging_bucket"`
	BigQueryConfig  *input.BigQueryConfig  `json:"bigquery_config,omitempty"`
	SnowflakeConfig *input.SnowflakeConfig `json:"snowflake_config,omitempty"`
	RedshiftConfig  *input.RedshiftConfig  `json:"redshift_config,omitempty"`
	MongoDbConfig   *input.MongoDbConfig   `json:"mongodb_config,omitempty"`
	WebhookConfig   *input.WebhookConfig   `json:"webhook_config,omitempty"`
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
	var webhookSigningKey string
	switch createDestinationRequest.ConnectionType {
	case models.ConnectionTypeBigQuery:
		encryptedCredentials, encryptionErr := s.cryptoService.EncryptConnectionCredentials(createDestinationRequest.BigQueryConfig.Credentials)
		if encryptionErr != nil {
			return encryptionErr
		}
		connection, err = connections.CreateBigQueryConnection(
			s.db, auth.Organization.ID, *encryptedCredentials, createDestinationRequest.BigQueryConfig.Location,
		)
	case models.ConnectionTypeSnowflake:
		encryptedCredentials, encryptionErr := s.cryptoService.EncryptConnectionCredentials(createDestinationRequest.SnowflakeConfig.Password)
		if encryptionErr != nil {
			return encryptionErr
		}
		connection, err = connections.CreateSnowflakeConnection(
			s.db, auth.Organization.ID, *createDestinationRequest.SnowflakeConfig, *encryptedCredentials,
		)
	case models.ConnectionTypeRedshift:
		encryptedCredentials, encryptionErr := s.cryptoService.EncryptConnectionCredentials(createDestinationRequest.RedshiftConfig.Password)
		if encryptionErr != nil {
			return encryptionErr
		}
		connection, err = connections.CreateRedshiftConnection(
			s.db, auth.Organization.ID, *createDestinationRequest.RedshiftConfig, *encryptedCredentials,
		)
	case models.ConnectionTypeMongoDb:
		encryptedCredentials, encryptionErr := s.cryptoService.EncryptConnectionCredentials(createDestinationRequest.MongoDbConfig.Password)
		if encryptionErr != nil {
			return encryptionErr
		}
		connection, err = connections.CreateMongoDbConnection(
			s.db, auth.Organization.ID, *createDestinationRequest.MongoDbConfig, *encryptedCredentials,
		)
	case models.ConnectionTypeWebhook:
		webhookSigningKey = crypto.GenerateSigningKey()
		encryptedSigningKey, encryptionErr := s.cryptoService.EncryptWebhookSigningKey(webhookSigningKey)
		if encryptionErr != nil {
			return encryptionErr
		}
		connection, err = connections.CreateWebhookConnection(
			s.db, auth.Organization.ID, *createDestinationRequest.WebhookConfig, *encryptedSigningKey,
		)
	default:
		return errors.Newf("unsupported connection type: %s", createDestinationRequest.ConnectionType)
	}

	if err != nil {
		return err
	}

	destination, err := destinations.CreateDestination(
		s.db,
		auth.Organization.ID,
		createDestinationRequest.DisplayName,
		connection.ID,
		createDestinationRequest.StagingBucket,
	)
	if err != nil {
		return err
	}

	if err != nil {
		return err
	}

	var destinationView views.Destination
	if connection.ConnectionType == models.ConnectionTypeWebhook {
		destinationView = views.ConvertWebhook(*destination, *connection, &webhookSigningKey)
	} else {
		destinationView = views.ConvertDestination(*destination, *connection)
	}

	return json.NewEncoder(w).Encode(CreateDestinationResponse{
		destinationView,
	})
}

func validateCreateDestinationRequest(request CreateDestinationRequest) error {
	switch request.ConnectionType {
	case models.ConnectionTypeBigQuery:
		return validateCreateBigQueryDestination(request)
	case models.ConnectionTypeSnowflake:
		return validateCreateSnowflakeDestination(request)
	case models.ConnectionTypeRedshift:
		return validateCreateRedshiftDestination(request)
	case models.ConnectionTypeMongoDb:
		return validateCreateMongoDbDestination(request)
	case models.ConnectionTypeWebhook:
		return validateCreateWebhookDestination(request)
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

func validateCreateRedshiftDestination(request CreateDestinationRequest) error {
	if request.RedshiftConfig == nil {
		return errors.NewBadRequest("missing Redshift configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateCreateMongoDbDestination(request CreateDestinationRequest) error {
	if request.MongoDbConfig == nil {
		return errors.NewBadRequest("missing MongoDB configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateCreateWebhookDestination(request CreateDestinationRequest) error {
	if request.WebhookConfig == nil {
		return errors.NewBadRequest("missing Webhook configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}
