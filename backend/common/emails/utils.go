package emails

import (
	"context"
	"fmt"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/secret"
)

const SENDGRID_PRODUCTION_API_KEY = "projects/454026596701/secrets/sendgrid-prod-api-key/versions/latest"
const SENDGRID_DEVELOPMENT_API_KEY = "projects/86315250181/secrets/sendgrid-dev-api-key/versions/latest"

func SendEmail(fromName string, fromAddress string, to string, subject string, html string, plain string) error {
	sendgridApiKey, err := getSendgridApiKey()
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) getting sendgrid api key")
	}

	client := sendgrid.NewSendClient(*sendgridApiKey)

	message := mail.NewSingleEmail(
		mail.NewEmail(fromName, fromAddress),
		subject,
		&mail.Email{
			Address: to,
		},
		plain,
		html,
	)

	res, err := client.Send(message)
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) sending email")
	}

	if res.StatusCode >= 400 {
		return errors.New(fmt.Sprintf("(emails.SendEmail) sendgrid returned status code %d", res.StatusCode))
	}

	return nil
}

func getSendgridApiKey() (*string, error) {
	var sendgridApiKeyKey string
	if application.IsProd() {
		sendgridApiKeyKey = SENDGRID_PRODUCTION_API_KEY
	} else {
		sendgridApiKeyKey = SENDGRID_DEVELOPMENT_API_KEY
	}

	sendgridApiKey, err := secret.FetchSecret(context.TODO(), sendgridApiKeyKey)
	if err != nil {
		return nil, errors.Wrap(err, "(emails.getSendgridApiKey) fetching secret")
	}

	return sendgridApiKey, nil
}
