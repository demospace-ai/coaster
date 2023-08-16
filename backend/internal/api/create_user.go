package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/sessions"
	"go.fabra.io/server/common/repositories/users"
	"go.fabra.io/server/common/views"
)

type CreateUserRequest struct {
	Email           string `json:"email" validate:"required,email"`
	FirstName       string `json:"first_name" validate:"required,min=2,max=100"`
	LastName        string `json:"last_name" validate:"required,min=2,max=100"`
	Password        string `json:"password" validate:"required,min=8,max=100"`
	ConfirmPassword string `json:"confirm_password" validate:"required"`
}

type CreateUserResponse struct {
	User views.User `json:"user"`
}

func (s ApiService) CreateUser(w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var createUserRequest CreateUserRequest
	err := decoder.Decode(&createUserRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateUser) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(createUserRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateUser) validating request")
	}

	if createUserRequest.Password != createUserRequest.ConfirmPassword {
		return errors.NewBadRequest("passwords do not match")
	}

	_, err = users.LoadByEmail(s.db, createUserRequest.Email)
	if err == nil {
		return errors.NewBadRequest("user already exists")
	}

	if !errors.IsRecordNotFound(err) {
		return errors.Wrap(err, "(api.CreateUser) unexpected error loading user by email")
	}

	user, err := users.CreateUserFromEmail(s.db, createUserRequest.Email, createUserRequest.FirstName, createUserRequest.LastName, createUserRequest.Password)
	if err != nil {

		return errors.Wrap(err, "(api.CreateUser) error creating user by email")
	}

	sessionToken, err := sessions.Create(s.db, user.ID)
	if err != nil {
		return errors.Wrap(err, "(api.CreateUser) could not create session")
	}

	auth.AddSessionCookie(w, *sessionToken)

	return json.NewEncoder(w).Encode(CreateUserResponse{
		User: views.ConvertUser(*user),
	})
}
