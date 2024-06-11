package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/input"
	"go.coaster.io/server/common/repositories/reset_tokens"
	"go.coaster.io/server/common/repositories/sessions"
	"go.coaster.io/server/common/repositories/users"
	"go.coaster.io/server/common/views"
)

type ResetPasswordRequest struct {
	Token    string `json:"token" validate:"required"`
	Password string `json:"password" validate:"required,min=8,max=100"`
}

func (s ApiService) ResetPassword(w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var resetPasswordRequest ResetPasswordRequest
	err := decoder.Decode(&resetPasswordRequest)
	if err != nil {
		return errors.Wrap(err, "(api.ResetPassword) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(resetPasswordRequest)
	if err != nil {
		return errors.Wrap(err, "(api.ResetPassword) validating request")
	}

	resetToken, err := reset_tokens.LoadValidByToken(s.db, resetPasswordRequest.Token)
	if err != nil {
		return errors.Wrap(err, "(api.ResetPassword) fetching valid token")
	}

	user, err := users.LoadUserByID(s.db, resetToken.UserID)
	if err != nil {
		return errors.Wrap(err, "(api.ResetPassword) no user found")
	}

	err = reset_tokens.DeactivateToken(s.db, resetToken)
	if err != nil {
		return errors.Wrap(err, "(api.ResetPassword) deactivating token")
	}

	_, err = users.UpdateUser(s.db, user, input.UserUpdates{
		Password: &resetPasswordRequest.Password,
	})
	if err != nil {
		return errors.Wrap(err, "(api.ResetPassword) updating password")
	}

	sessionToken, err := sessions.Create(s.db, user.ID)
	if err != nil {
		return errors.Wrap(err, "(api.ResetPassword) could not create session")
	}

	auth.AddSessionCookie(w, *sessionToken)

	return json.NewEncoder(w).Encode(
		views.ConvertUser(*user),
	)
}
