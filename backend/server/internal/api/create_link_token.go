package api

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/link_tokens"
)

type CreateLinkTokenRequest struct {
	EndCustomerId int64 `json:"end_customer_id" validate:"required"`
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
		return err
	}

	rawLinkToken := generateLinkToken()
	_, err = link_tokens.CreateLinkToken(s.db, auth.Organization.ID, createLinkTokenRequest.EndCustomerId, crypto.HashString(rawLinkToken))
	if err != nil {
		return err
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
