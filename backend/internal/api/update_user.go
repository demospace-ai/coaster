package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/input"
	"go.coaster.io/server/common/repositories/users"
	"go.coaster.io/server/common/views"
)

type UpdateUserRequest = input.UserUpdates

func (s ApiService) UpdateUser(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var updateUserRequest UpdateUserRequest
	err := decoder.Decode(&updateUserRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateUser) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(updateUserRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateUser) validating request")
	}

	user, err := users.UpdateUser(
		s.db,
		auth.User,
		updateUserRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateUser) updating user")
	}

	return json.NewEncoder(w).Encode(views.ConvertUser(*user))
}
