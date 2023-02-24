package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
)

type CreateObjectRequest struct {
	DisplayName      string              `json:"display_name" validate:"required"`
	DestinationID    int64               `json:"destination_id" validate:"required"`
	Namespace        string              `json:"namespace,omitempty" validate:"required"`
	TableName        string              `json:"table_name,omitempty" validate:"required"`
	CustomerIdColumn string              `json:"customer_id_column" validate:"required"`
	ObjectFields     []input.ObjectField `json:"object_fields"`
}

type CreateObjectResponse struct {
	Object views.Object `json:"model"`
}

func (s ApiService) CreateObject(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createObjectRequest CreateObjectRequest
	err := decoder.Decode(&createObjectRequest)
	if err != nil {
		return err
	}

	validate := validator.New()
	err = validate.Struct(createObjectRequest)
	if err != nil {
		return err
	}

	// TODO: create model and fields in a transaction
	model, err := objects.CreateObject(
		s.db,
		auth.Organization.ID,
		createObjectRequest.DisplayName,
		createObjectRequest.DestinationID,
		createObjectRequest.Namespace,
		createObjectRequest.TableName,
		createObjectRequest.CustomerIdColumn,
	)
	if err != nil {
		return err
	}

	modelFields, err := objects.CreateObjectFields(s.db, auth.Organization.ID, model.ID, createObjectRequest.ObjectFields)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateObjectResponse{
		views.ConvertObject(*model, modelFields),
	})
}
