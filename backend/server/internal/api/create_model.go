package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/repositories/customer_models"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
)

type CreateModelRequest struct {
	DisplayName      string             `json:"display_name" validate:"required"`
	DestinationID    int64              `json:"destination_id" validate:"required"`
	Namespace        string             `json:"namespace,omitempty" validate:"required"`
	TableName        string             `json:"table_name,omitempty" validate:"required"`
	CustomerIdColumn string             `json:"customer_id_column" validate:"required"`
	ModelFields      []input.ModelField `json:"model_fields"`
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
		return err
	}

	// TODO: create model and fields in a transaction
	model, err := customer_models.CreateModel(
		s.db,
		auth.Organization.ID,
		createModelRequest.DisplayName,
		createModelRequest.DestinationID,
		createModelRequest.Namespace,
		createModelRequest.TableName,
		createModelRequest.CustomerIdColumn,
	)
	if err != nil {
		return err
	}

	modelFields, err := customer_models.CreateModelFields(s.db, auth.Organization.ID, model.ID, createModelRequest.ModelFields)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateModelResponse{
		views.ConvertModel(*model, modelFields),
	})
}
