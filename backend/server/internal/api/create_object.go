package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
)

var VALID_CURSOR_TYPES = map[data.FieldType]bool{
	data.FieldTypeDate:        true,
	data.FieldTypeDateTimeTz:  true,
	data.FieldTypeDateTimeNtz: true,
	data.FieldTypeTimestamp:   true,
	data.FieldTypeInteger:     true,
	data.FieldTypeNumber:      true,
}

type CreateObjectRequest struct {
	DisplayName        string                `json:"display_name" validate:"required"`
	DestinationID      int64                 `json:"destination_id" validate:"required"`
	TargetType         models.TargetType     `json:"target_type" validate:"required"`
	Namespace          *string               `json:"namespace,omitempty"`
	TableName          *string               `json:"table_name,omitempty"`
	SyncMode           models.SyncMode       `json:"sync_mode" validate:"required"`
	CursorField        *string               `json:"cursor_field,omitempty"`
	PrimaryKey         *string               `json:"primary_key,omitempty"`
	EndCustomerIDField string                `json:"end_customer_id_field" validate:"required"`
	Frequency          int64                 `json:"frequency" validate:"required"`
	FrequencyUnits     models.FrequencyUnits `json:"frequency_units" validate:"required"`
	ObjectFields       []input.ObjectField   `json:"object_fields"`
}

type CreateObjectResponse struct {
	Object views.Object `json:"model"`
}

func (s ApiService) CreateObject(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "CreateObject")
	}

	decoder := json.NewDecoder(r.Body)
	var createObjectRequest CreateObjectRequest
	err := decoder.Decode(&createObjectRequest)
	if err != nil {
		return errors.Wrap(err, "CreateObject")
	}

	validate := validator.New()
	err = validate.Struct(createObjectRequest)
	if err != nil {
		return errors.Wrap(err, "CreateObject")
	}

	if createObjectRequest.CursorField != nil {
		var cursorField input.ObjectField
		for _, objectField := range createObjectRequest.ObjectFields {
			if objectField.Name == *createObjectRequest.CursorField {
				cursorField = objectField
			}
		}

		if _, validCursorField := VALID_CURSOR_TYPES[cursorField.Type]; !validCursorField {
			return errors.Wrap(errors.NewBadRequestf("invalid cursor field type: %s", cursorField.Type), "CreateObject")
		}
	}

	// TODO: create model and fields in a transaction
	object, err := objects.CreateObject(
		s.db,
		auth.Organization.ID,
		createObjectRequest.DisplayName,
		createObjectRequest.DestinationID,
		createObjectRequest.TargetType,
		createObjectRequest.Namespace,
		createObjectRequest.TableName,
		createObjectRequest.SyncMode,
		createObjectRequest.CursorField,
		createObjectRequest.PrimaryKey,
		createObjectRequest.EndCustomerIDField,
		createObjectRequest.Frequency,
		createObjectRequest.FrequencyUnits,
	)
	if err != nil {
		return errors.Wrap(err, "CreateObject")
	}

	// Ensure that the end customer ID field is marked as omit. It should not be exposed to the end customer
	for i := range createObjectRequest.ObjectFields {
		if createObjectRequest.ObjectFields[i].Name == createObjectRequest.EndCustomerIDField {
			createObjectRequest.ObjectFields[i].Omit = true
		}
	}

	objectFields, err := objects.CreateObjectFields(s.db, auth.Organization.ID, object.ID, createObjectRequest.ObjectFields)
	if err != nil {
		return errors.Wrap(err, "CreateObject")
	}

	return json.NewEncoder(w).Encode(CreateObjectResponse{
		views.ConvertObject(object, objectFields),
	})
}
