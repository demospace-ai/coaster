package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-playground/validator"
	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/repositories/sessions"
	"go.coaster.io/server/common/repositories/users"
	"go.coaster.io/server/common/views"
	"golang.org/x/crypto/bcrypt"
)

type EmailLoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=100"`
}

type EmailLoginResponse struct {
	User views.User `json:"user"`
}

func (s ApiService) EmailLogin(w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var emailLoginRequest EmailLoginRequest
	err := decoder.Decode(&emailLoginRequest)
	if err != nil {
		return errors.Wrap(err, "(api.EmailLogin) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(emailLoginRequest)
	if err != nil {
		return errors.Wrap(err, "(api.EmailLogin) validating request")
	}

	email := strings.ToLower(emailLoginRequest.Email)
	user, err := users.LoadByEmail(s.db, email)
	if err != nil {
		return errors.Wrap(err, "(api.EmailLogin) unexpected error loading user by email")
	}

	if user.HashedPassword == nil {
		return errors.New("(api.EmailLogin) user does not user password login")
	}

	err = bcrypt.CompareHashAndPassword([]byte(*user.HashedPassword), []byte(emailLoginRequest.Password))
	if err != nil {
		return errors.NewBadRequest("invalid password")
	}

	sessionToken, err := sessions.Create(s.db, user.ID)
	if err != nil {
		return errors.Wrap(err, "(api.EmailLogin) could not create session")
	}

	auth.AddSessionCookie(w, *sessionToken)

	return json.NewEncoder(w).Encode(EmailLoginResponse{
		User: views.ConvertUser(*user),
	})
}
