package handlers

import (
	"encoding/json"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type CreateEventSetRequest struct {
	DisplayName          string  `json:"display_name" validate:"required"`
	ConnectionID         int64   `json:"connection_id" validate:"required"`
	DatasetName          string  `json:"dataset_name" validate:"required"`
	TableName            string  `json:"table_name" validate:"required"`
	EventTypeColumn      string  `json:"event_type_column" validate:"required"`
	TimestampColumn      string  `json:"timestamp_column" validate:"required"`
	UserIdentifierColumn string  `json:"user_identifier_column" validate:"required"`
	CustomJoin           *string `json:"custom_join,omitempty"`
}

type CreateEventSetResponse struct {
	EventSet models.EventSet
}

func CreateEventSet(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	if env.Auth.Organization == nil {
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

	eventSet, err := eventsets.CreateEventSet(
		env.Db,
		env.Auth.Organization.ID,
		createEventSetRequest.DisplayName,
		createEventSetRequest.ConnectionID,
		createEventSetRequest.DatasetName,
		createEventSetRequest.TableName,
		createEventSetRequest.EventTypeColumn,
		createEventSetRequest.TimestampColumn,
		createEventSetRequest.UserIdentifierColumn,
		createEventSetRequest.CustomJoin,
	)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateEventSetResponse{
		*eventSet,
	})
}
