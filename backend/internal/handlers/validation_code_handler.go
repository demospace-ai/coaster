package handlers

import (
	"encoding/json"
	"fabra/internal/errors"
	"fabra/internal/users"
	"fabra/internal/verifications"
	"net/http"
	"regexp"

	"github.com/mailgun/mailgun-go"
)

const mailgunDomain = "app.fabra.io"
const emailRegex = "^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"

type ValidationCodeRequest struct {
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func ValidationCode(env Env, w http.ResponseWriter, r *http.Request) error {
	//apiKey := config.GetMailgunApiKey()
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

	user, err := users.GetOrCreateForEmail(env.Db, request.Email, request.FirstName, request.LastName)
	if err != nil {
		return err
	}

	code, err := verifications.Create(env.Db, user.ID)
	if err != nil {
		return err
	}

	mg := mailgun.NewMailgun(mailgunDomain, apiKey)
	m := mg.NewMessage(
		"Fabra <app@fabra.io>",
		"Verification Code",
		*code,
		request.Email,
	)

	_, _, err = mg.Send(m)
	return err
}
