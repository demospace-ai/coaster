package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/connections"
	"fabra/internal/errors"
	"fabra/internal/input"
	"fabra/internal/models"
	"fabra/internal/sources"
	"fabra/internal/views"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type CreateSourceRequest struct {
	EndCustomerID   int64                  `json:"end_customer_id" validate:"required"`
	DisplayName     string                 `json:"display_name" validate:"required"`
	ConnectionType  models.ConnectionType  `json:"connection_type"`
	BigQueryConfig  *input.BigQueryConfig  `json:"bigquery_config,omitempty"`
	SnowflakeConfig *input.SnowflakeConfig `json:"snowflake_config,omitempty"`
	Namespace       *string                `json:"namespace,omitempty"`
	TableName       *string                `json:"table_name,omitempty"`
	CustomJoin      *string                `json:"custom_join,omitempty"`
}

type CreateSourceResponse struct {
	Source views.Source
}

func (s ApiService) CreateSyncConfiguration(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createSourceRequest CreateSourceRequest
	err := decoder.Decode(&createSourceRequest)
	if err != nil {
		return err
	}

	validate := validator.New()
	err = validate.Struct(createSourceRequest)
	if err != nil {
		return nil
	}

	if (createSourceRequest.TableName == nil || createSourceRequest.Namespace == nil) && createSourceRequest.CustomJoin == nil {
		return errors.NewBadRequest("must have table_name and namespace or custom_join")
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
			s.db, auth.Organization.ID, createSourceRequest.DisplayName, *encryptedCredentials,
		)
	case models.ConnectionTypeSnowflake:
		encryptedCredentials, err = s.cryptoService.EncryptConnectionCredentials(createSourceRequest.SnowflakeConfig.Password)
		if err != nil {
			return err
		}
		connection, err = connections.CreateSnowflakeConnection(
			s.db, auth.Organization.ID,
			createSourceRequest.DisplayName,
			*createSourceRequest.SnowflakeConfig,
			*encryptedCredentials,
		)
	}

	if err != nil {
		return err
	}

	source, err := sources.CreateSource(
		s.db,
		auth.Organization.ID,
		createSourceRequest.DisplayName,
		connection.ID,
		createSourceRequest.Namespace,
		createSourceRequest.TableName,
		createSourceRequest.CustomJoin,
	)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateSourceResponse{
		views.ConvertSource(*source, *connection),
	})
}
