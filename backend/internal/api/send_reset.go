package api

import (
	"bytes"
	"encoding/json"
	"html/template"
	"net/http"
	"os"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/emails"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/reset_tokens"
	"go.fabra.io/server/common/repositories/users"
)

type SendResetRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetTemplateArgs struct {
	FirstName string
	Token     string
	Domain    string
}

func (s ApiService) SendReset(w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var sendResetRequest SendResetRequest
	err := decoder.Decode(&sendResetRequest)
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(sendResetRequest)
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) validating request")
	}

	user, err := users.LoadByEmail(s.db, sendResetRequest.Email)
	if err != nil {
		// TODO: return something more informative here
		return errors.Wrap(err, "(api.SendReset) no user for this email")
	}

	// TODO: rate limit and send email
	token, err := reset_tokens.GetActiveResetToken(s.db, user)
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) creating reset token")
	}

	wd, err := os.Getwd()
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) getting working directory")
	}

	var domain string
	if application.IsProd() {
		domain = "https://trycoaster.com"
	} else {
		domain = "http://localhost:3000"
	}

	var html bytes.Buffer
	tmpl := template.Must(template.ParseFiles(wd + "/common/emails/templates/reset_password.html.tmpl"))
	tmpl.Execute(&html, ResetTemplateArgs{
		FirstName: user.FirstName,
		Token:     token.Token,
		Domain:    domain,
	})

	err = emails.SendEmail("Coaster Support <support@mail.trycoaster.com>", []string{sendResetRequest.Email}, "Reset your password", html.String())
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) sending email")
	}

	return nil
}
