package emails

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/resend/resend-go/v2"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/secret"
)

const RESEND_PRODUCTION_API_KEY_KEY = "projects/454026596701/secrets/resend-prod-api-key/versions/latest"
const RESEND_DEVELOPMENT_API_KEY_KEY = "projects/86315250181/secrets/resend-dev-api-key/versions/latest"

const LOOPS_PRODUCTION_API_KEY_KEY = "projects/454026596701/secrets/loops-prod-api-key/versions/latest"
const LOOPS_DEVELOPMENT_API_KEY_KEY = "projects/86315250181/secrets/loops-dev-api-key/versions/latest"

func SendEmail(from string, to string, subject string, html string, plain string) error {
	apiKey, err := getResendApiKey()
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) getting Resend API key")
	}

	client := resend.NewClient(*apiKey)

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{to},
		Subject: subject,
		Text:    plain,
		Html:    html,
		ReplyTo: "replyto@example.com",
	}

	_, err = client.Emails.Send(params)
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) sending email")
	}

	return nil
}

type CreateContactRequest struct {
	Email      string `json:"email"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	Subscribed bool   `json:"subscribed"`
	UserGroup  string `json:"userGroup"`
	UserId     string `json:"userId"`
}

func CreateContact(email string, firstName string, lastName string, userID int64) error {
	loopsApiKey, err := getLoopsApiKey()
	if err != nil {
		return errors.Wrap(err, "(emails.CreateContact) fetching secret")
	}

	bearerToken := fmt.Sprintf("Bearer %s", *loopsApiKey)

	url := "https://app.loops.so/api/v1/contacts/create"

	payload := CreateContactRequest{
		Email:      email,
		FirstName:  firstName,
		LastName:   lastName,
		Subscribed: true,
		UserGroup:  "users",
		UserId:     strconv.FormatInt(userID, 10),
	}

	json, err := json.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "(emails.CreateContact) marshalling payload")
	}

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(json))

	req.Header.Add("Authorization", bearerToken)
	req.Header.Add("Content-Type", "application/json")

	_, error := http.DefaultClient.Do(req)
	if error != nil {
		return errors.Wrap(error, "(emails.CreateContact) creating contact")
	}

	return nil
}

func getResendApiKey() (*string, error) {
	var resendApiTokenKey string
	if application.IsProd() {
		resendApiTokenKey = RESEND_PRODUCTION_API_KEY_KEY
	} else {
		resendApiTokenKey = RESEND_DEVELOPMENT_API_KEY_KEY
	}

	resendApiToken, err := secret.FetchSecret(context.TODO(), resendApiTokenKey)
	if err != nil {
		return nil, errors.Wrap(err, "(emails.getResendApiKey) fetching secret")
	}

	return resendApiToken, nil
}

func getLoopsApiKey() (*string, error) {
	var loopsApiKeyKey string
	if application.IsProd() {
		loopsApiKeyKey = LOOPS_PRODUCTION_API_KEY_KEY
	} else {
		loopsApiKeyKey = LOOPS_DEVELOPMENT_API_KEY_KEY
	}

	loopsApiKey, err := secret.FetchSecret(context.TODO(), loopsApiKeyKey)
	if err != nil {
		return nil, errors.Wrap(err, "(emails.getLoopsApiKey) fetching secret")
	}

	return loopsApiKey, nil
}
