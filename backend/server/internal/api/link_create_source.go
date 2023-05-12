package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
)

func (s ApiService) LinkCreateSource(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	if auth.LinkToken == nil {
		return errors.NewBadRequest("must send link token")
	}

	decoder := json.NewDecoder(r.Body)
	var createSourceRequest CreateSourceRequest
	err := decoder.Decode(&createSourceRequest)
	if err != nil {
		return errors.NewCustomerVisibleError(err)
	}

	// TODO: validate connection parameters
	validate := validator.New()
	err = validate.Struct(createSourceRequest)
	if err != nil {
		return errors.NewCustomerVisibleError(err)
	}

	// Ignore end customer ID from request, use the one from the link token
	source, connection, err := s.createSource(auth, createSourceRequest, auth.LinkToken.EndCustomerID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateSourceResponse{
		views.ConvertSource(*source, *connection),
	})
}
