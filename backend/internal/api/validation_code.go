package api

import (
	"encoding/json"
	"net/http"
	"regexp"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/users"
	"go.fabra.io/server/common/repositories/verifications"

	"github.com/mailgun/mailgun-go"
)

const mailgunDomain = "app.go.fabra.io"
const emailRegex = "^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"

type ValidationCodeRequest struct {
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func (s ApiService) ValidationCode(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	// apiKey := config.GetMailgunApiKey()
	// TODO: fill this out
	apiKey := "todo"

	decoder := json.NewDecoder(r.Body)
	var request ValidationCodeRequest
	err := decoder.Decode(&request)
	if err != nil {
		return err
	}

	// regex isn't perfect, but try not to send to poorly formatted emails
	re := regexp.MustCompile(emailRegex)
	if !re.MatchString(request.Email) {
		return errors.BadRequest
	}

	user, err := users.GetOrCreateForEmail(s.db, request.Email, request.FirstName, request.LastName)
	if err != nil {
		return err
	}

	code, err := verifications.Create(s.db, user.ID)
	if err != nil {
		return err
	}

	mg := mailgun.NewMailgun(mailgunDomain, apiKey)
	m := mg.NewMessage(
		"Fabra <app@go.fabra.io>",
		"Verification Code",
		*code,
		request.Email,
	)

	_, _, err = mg.Send(m)
	return err
}
