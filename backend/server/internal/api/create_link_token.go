package api

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/repositories/link_tokens"
	"go.fabra.io/server/common/repositories/webhooks"
	"gorm.io/gorm"
)

type CreateLinkTokenRequest struct {
	EndCustomerID string             `json:"end_customer_id" validate:"required"`
	WebhookData   *input.WebhookData `json:"webhook_data,omitempty"`
}

type CreateLinkTokenResponse struct {
	LinkToken string `json:"link_token"`
}

func (s ApiService) CreateLinkToken(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("cannot request users without organization")
	}

	decoder := json.NewDecoder(r.Body)
	var createLinkTokenRequest CreateLinkTokenRequest
	err := decoder.Decode(&createLinkTokenRequest)
	if err != nil {
		return errors.Wrap(err, "CreateLinkToken")
	}

	rawLinkToken := generateLinkToken()
	_, err = link_tokens.CreateLinkToken(s.db, auth.Organization.ID, createLinkTokenRequest.EndCustomerID, crypto.HashString(rawLinkToken))
	if err != nil {
		return errors.Wrap(err, "CreateLinkToken")
	}

	if createLinkTokenRequest.WebhookData != nil {
		if createLinkTokenRequest.WebhookData.EndCustomerApiKey != nil {
			encryptedEndCustomerApiKey, err := s.cryptoService.EncryptEndCustomerApiKey(*createLinkTokenRequest.WebhookData.EndCustomerApiKey)
			if err != nil {
				return errors.Wrap(err, "CreateLinkToken")
			}

			// this operation always replaces the existing api key
			err = s.db.Transaction(func(tx *gorm.DB) error {
				err = webhooks.DeactivateExistingEndCustomerApiKey(tx, auth.Organization.ID, createLinkTokenRequest.EndCustomerID)
				if err != nil {
					return errors.Wrap(err, "CreateLinkToken")
				}

				err = webhooks.CreateEndCustomerApiKey(tx, auth.Organization.ID, createLinkTokenRequest.EndCustomerID, *encryptedEndCustomerApiKey)
				if err != nil {
					return errors.Wrap(err, "CreateLinkToken")
				}

				return nil
			})

			if err != nil {
				return errors.Wrap(err, "CreateLinkToken")
			}
		}
	}

	return json.NewEncoder(w).Encode(CreateLinkTokenResponse{
		LinkToken: rawLinkToken,
	})
}

func generateLinkToken() string {
	randomBytes := make([]byte, 32)
	_, err := rand.Read(randomBytes)
	if err != nil {
		panic(err)
	}
	return base64.StdEncoding.EncodeToString(randomBytes)
}
