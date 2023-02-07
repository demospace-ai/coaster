package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/syncconfigurations"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type CreateSyncConfigurationRequest struct {
	DisplayName  string  `json:"display_name" validate:"required"`
	ConnectionID int64   `json:"connection_id" validate:"required"`
	DatasetName  *string `json:"dataset_name,omitempty"`
	TableName    *string `json:"table_name,omitempty"`
	CustomJoin   *string `json:"custom_join,omitempty"`
	SetDefault   bool    `json:"set_default,omitempty"`
}

type CreateSyncConfigurationResponse struct {
	SyncConfiguration models.SyncConfiguration
}

func (s ApiService) CreateSyncConfiguration(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createSyncConfigurationRequest CreateSyncConfigurationRequest
	err := decoder.Decode(&createSyncConfigurationRequest)
	if err != nil {
		return err
	}

	validate := validator.New()
	err = validate.Struct(createSyncConfigurationRequest)
	if err != nil {
		return nil
	}

	if (createSyncConfigurationRequest.TableName == nil || createSyncConfigurationRequest.DatasetName == nil) && createSyncConfigurationRequest.CustomJoin == nil {
		return errors.NewBadRequest("must have table_name and dataset_name or custom_join")
	}

	// TODO: record the end customer's ID as well
	syncConfiguration, err := syncconfigurations.CreateSyncConfiguration(
		s.db,
		auth.Organization.ID,
		createSyncConfigurationRequest.DisplayName,
		createSyncConfigurationRequest.ConnectionID,
		createSyncConfigurationRequest.DatasetName,
		createSyncConfigurationRequest.TableName,
		createSyncConfigurationRequest.CustomJoin,
	)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateSyncConfigurationResponse{
		*syncConfiguration,
	})
}
