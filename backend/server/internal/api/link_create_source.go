package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
)

type CreateSourceLinkRequest struct {
	DisplayName     string                 `json:"display_name" validate:"required"`
	ConnectionType  models.ConnectionType  `json:"connection_type"`
	BigQueryConfig  *input.BigQueryConfig  `json:"bigquery_config,omitempty"`
	SnowflakeConfig *input.SnowflakeConfig `json:"snowflake_config,omitempty"`
	RedshiftConfig  *input.RedshiftConfig  `json:"redshift_config,omitempty"`
	MongoDbConfig   *input.MongoDbConfig   `json:"mongodb_config,omitempty"`
	SynapseConfig   *input.SynapseConfig   `json:"synapse_config,omitempty"`
}

func (s ApiService) LinkCreateSource(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	if auth.LinkToken == nil {
		return errors.NewBadRequest("must send link token")
	}

	decoder := json.NewDecoder(r.Body)
	var createSourceRequest CreateSourceLinkRequest
	err := decoder.Decode(&createSourceRequest)
	if err != nil {
		return err
	}

	// TODO: validate connection parameters
	validate := validator.New()
	err = validate.Struct(createSourceRequest)
	if err != nil {
		return err
	}

	// TODO: Create connection + source in a transaction
	var connection *models.Connection
	var encryptedCredentials *string
	switch createSourceRequest.ConnectionType {
	case models.ConnectionTypeBigQuery:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createSourceRequest.BigQueryConfig.Credentials)
		if err != nil {
			return err
		}
		connection, err = connections.CreateBigQueryConnection(
			s.db, auth.Organization.ID, *encryptedCredentials, createSourceRequest.BigQueryConfig.Location,
		)
	case models.ConnectionTypeSnowflake:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createSourceRequest.SnowflakeConfig.Password)
		if err != nil {
			return err
		}
		connection, err = connections.CreateSnowflakeConnection(
			s.db, auth.Organization.ID, *createSourceRequest.SnowflakeConfig, *encryptedCredentials,
		)
	case models.ConnectionTypeRedshift:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createSourceRequest.RedshiftConfig.Password)
		if err != nil {
			return err
		}
		connection, err = connections.CreateRedshiftConnection(
			s.db, auth.Organization.ID, *createSourceRequest.RedshiftConfig, *encryptedCredentials,
		)
	case models.ConnectionTypeMongoDb:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createSourceRequest.MongoDbConfig.Password)
		if err != nil {
			return err
		}
		connection, err = connections.CreateMongoDbConnection(
			s.db, auth.Organization.ID, *createSourceRequest.MongoDbConfig, *encryptedCredentials,
		)
	case models.ConnectionTypeSynapse:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createSourceRequest.SynapseConfig.Password)
		if err != nil {
			return err
		}
		connection, err = connections.CreateSynapseConnection(
			s.db, auth.Organization.ID, *createSourceRequest.SynapseConfig, *encryptedCredentials,
		)
	default:
		return errors.Newf("unsupported connection type: %s", createSourceRequest.ConnectionType)
	}

	if err != nil {
		return err
	}

	source, err := sources.CreateSource(
		s.db,
		auth.Organization.ID,
		createSourceRequest.DisplayName,
		auth.LinkToken.EndCustomerID,
		connection.ID,
	)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateSourceResponse{
		views.ConvertSource(*source, *connection),
	})
}
