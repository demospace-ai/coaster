package emails

import (
	"context"

	"github.com/resend/resend-go/v2"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/secret"
)

const RESEND_PRODUCTION_API_KEY_KEY = "projects/454026596701/secrets/resend-prod-api-key/versions/latest"
const RESEND_DEVELOPMENT_API_KEY_KEY = "projects/86315250181/secrets/resend-dev-api-key/versions/latest"

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
