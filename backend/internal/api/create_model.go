package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/customermodels"
	"fabra/internal/errors"
	"fabra/internal/input"
	"fabra/internal/views"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type CreateModelRequest struct {
	EndCustomerID    int64              `json:"end_customer_id" validate:"required"`
	DisplayName      string             `json:"display_name" validate:"required"`
	DestinationID    int64              `json:"destination_id" validate:"required"`
	Namespace        *string            `json:"namespace,omitempty"`
	TableName        *string            `json:"table_name,omitempty"`
	CustomJoin       *string            `json:"custom_join,omitempty"`
	CustomerIdColumn string             `json:"customer_id_column" validate:"required"`
	ModelFields      []input.ModelField `json:"model_fields" validate:"required"`
}

type CreateModelResponse struct {
	Model views.Model `json:"model"`
}

func (s ApiService) CreateModel(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createModelRequest CreateModelRequest
	err := decoder.Decode(&createModelRequest)
	if err != nil {
		return err
	}

	validate := validator.New()
	err = validate.Struct(createModelRequest)
	if err != nil {
		return nil
	}

	if (createModelRequest.TableName == nil || createModelRequest.Namespace == nil) && createModelRequest.CustomJoin == nil {
		return errors.NewBadRequest("must have table_name and namespace or custom_join")
	}

	// TODO: create model and fields in a transaction
	model, err := customermodels.CreateModel(
		s.db,
		auth.Organization.ID,
		createModelRequest.DisplayName,
		createModelRequest.DestinationID,
		createModelRequest.Namespace,
		createModelRequest.TableName,
		createModelRequest.CustomJoin,
		createModelRequest.CustomerIdColumn,
	)
	if err != nil {
		return err
	}

	modelFields, err := customermodels.CreateModelFields(s.db, auth.Organization.ID, model.ID, createModelRequest.ModelFields)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateModelResponse{
		views.ConvertModel(*model, modelFields),
	})
}
