package emails

import (
	"context"

	"github.com/resendlabs/resend-go"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/secret"
)

const RESEND_PRODUCTION_API_KEY = "projects/454026596701/secrets/resend-prod-api-key/versions/latest"
const RESEND_DEVELOPMENT_API_KEY = "projects/86315250181/secrets/resend-dev-api-key/versions/latest"

func SendEmail(from string, to []string, subject string, html string) error {
	resendApiKey, err := getResendApiKey()
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) getting resend api key")
	}

	client := resend.NewClient(*resendApiKey)

	params := &resend.SendEmailRequest{
		From:    from,
		To:      to,
		Subject: subject,
		Html:    html,
	}

	_, err = client.Emails.Send(params)
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) sending email")
	}

	return nil
}

func getResendApiKey() (*string, error) {
	var resendApiKeyKey string
	if application.IsProd() {
		resendApiKeyKey = RESEND_PRODUCTION_API_KEY
	} else {
		resendApiKeyKey = RESEND_DEVELOPMENT_API_KEY
	}

	resendApiKey, err := secret.FetchSecret(context.TODO(), resendApiKeyKey)
	if err != nil {
		return nil, errors.Wrap(err, "(emails.getResendApiKey) fetching secret")
	}

	return resendApiKey, nil
}
