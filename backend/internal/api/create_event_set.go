package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/organizations"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type CreateEventSetRequest struct {
	DisplayName          string  `json:"display_name" validate:"required"`
	ConnectionID         int64   `json:"connection_id" validate:"required"`
	DatasetName          *string `json:"dataset_name,omitempty"`
	TableName            *string `json:"table_name,omitempty"`
	CustomJoin           *string `json:"custom_join,omitempty"`
	EventTypeColumn      string  `json:"event_type_column" validate:"required"`
	TimestampColumn      string  `json:"timestamp_column" validate:"required"`
	UserIdentifierColumn string  `json:"user_identifier_column" validate:"required"`
	SetDefault           bool    `json:"set_default,omitempty"`
}

type CreateEventSetResponse struct {
	EventSet models.EventSet
}

func (s ApiService) CreateEventSet(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createEventSetRequest CreateEventSetRequest
	err := decoder.Decode(&createEventSetRequest)
	if err != nil {
		return err
	}

	validate := validator.New()
	err = validate.Struct(createEventSetRequest)
	if err != nil {
		return nil
	}

	if (createEventSetRequest.TableName == nil || createEventSetRequest.DatasetName == nil) && createEventSetRequest.CustomJoin == nil {
		return errors.NewBadRequest("must have table_name and dataset_name or custom_join")
	}

	eventSet, err := eventsets.CreateEventSet(
		s.db,
		auth.Organization.ID,
		createEventSetRequest.DisplayName,
		createEventSetRequest.ConnectionID,
		createEventSetRequest.DatasetName,
		createEventSetRequest.TableName,
		createEventSetRequest.CustomJoin,
		createEventSetRequest.EventTypeColumn,
		createEventSetRequest.TimestampColumn,
		createEventSetRequest.UserIdentifierColumn,
	)
	if err != nil {
		return err
	}

	if createEventSetRequest.SetDefault {
		organizations.SetOrganizationDefaultEventSet(s.db, auth.Organization, eventSet.ID)
	}

	return json.NewEncoder(w).Encode(CreateEventSetResponse{
		*eventSet,
	})
}
