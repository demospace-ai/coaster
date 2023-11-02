package emails

import (
	"context"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/postmark"
	"go.fabra.io/server/common/secret"
)

const POSTMARK_PRODUCTION_API_TOKEN_KEY = "projects/454026596701/secrets/postmark-prod-api-token/versions/latest"
const POSTMARK_DEVELOPMENT_API_TOKEN_KEY = "projects/86315250181/secrets/postmark-dev-api-token/versions/latest"

func SendEmail(from string, to string, subject string, html string, plain string) error {
	postmarkApiToken, err := getPostmarkApiToken()
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) getting postmark api key")
	}

	client := postmark.NewClient(*postmarkApiToken)

	message := postmark.Email{
		From:     from,
		To:       to,
		Subject:  subject,
		TextBody: plain,
		HtmlBody: html,
	}

	_, err = client.SendEmail(message)
	if err != nil {
		return errors.Wrap(err, "(emails.SendEmail) sending email")
	}

	return nil
}

func getPostmarkApiToken() (*string, error) {
	var postmarkApiTokenKey string
	if application.IsProd() {
		postmarkApiTokenKey = POSTMARK_PRODUCTION_API_TOKEN_KEY
	} else {
		postmarkApiTokenKey = POSTMARK_DEVELOPMENT_API_TOKEN_KEY
	}

	postmarkApiToken, err := secret.FetchSecret(context.TODO(), postmarkApiTokenKey)
	if err != nil {
		return nil, errors.Wrap(err, "(emails.getPostmarkApiKey) fetching secret")
	}

	return postmarkApiToken, nil
}
