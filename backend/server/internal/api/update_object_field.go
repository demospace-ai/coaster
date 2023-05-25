package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
)

type UpdateObjectFieldsRequest struct {
	ID int64 `json:"id" validate:"required"`
	objects.PartialUpdateObjectFieldInput
}

type UpdateObjectFieldsResponse struct {
	ObjectFields []views.ObjectField `json:"object_fields"`
	Failures     []int64             `json:"failures"`
}

func (s ApiService) UpdateObjectFields(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var requestBody []UpdateObjectFieldsRequest
	if err := decoder.Decode(&requestBody); err != nil {
		return err
	}

	for _, requestItem := range requestBody {
		validate := validator.New()
		err := validate.Struct(requestItem)
		if err != nil {
			return err
		}
	}

	responseViews := []views.ObjectField{}
	failures := []int64{}
	for _, objectField := range requestBody {
		updatedObjectField, err := objects.PartialUpdateObjectField(
			s.db,
			auth.Organization.ID,
			objectField.ID,
			objectField.PartialUpdateObjectFieldInput,
		)
		if err == nil {
			updated := views.ConvertObjectField(updatedObjectField)
			responseViews = append(responseViews, updated)
		} else {
			failures = append(failures, objectField.ID)
		}
	}

	return json.NewEncoder(w).Encode(UpdateObjectFieldsResponse{
		ObjectFields: responseViews,
		Failures:     failures,
	})
}
