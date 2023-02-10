package api

import (
	"crypto/rand"
	"encoding/base64"
	"fabra/internal/apikeys"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fmt"
	"net/http"
)

type GetApiKeyResponse struct {
	ApiKey string `json:"api_key"`
}

func (s ApiService) GetApiKey(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("cannot request users without organization")
	}

	apiKey, err := s.GetOrCreateApiKey(auth.Organization.ID)
	if err != nil {
		return err
	}

	_, err = fmt.Fprintf(w, *apiKey)
	return err
}

func (s ApiService) GetOrCreateApiKey(organizationID int64) (*string, error) {
	apiKey, err := apikeys.LoadApiKeyForOrganization(s.db, organizationID)
	if err != nil {
		// no api key found, so just generate one now
		if errors.IsRecordNotFound(err) {
			rawApiKey := generateApiKey()
			encryptedApiKey, err := s.cryptoService.EncryptApiKey(rawApiKey)
			if err != nil {
				return nil, err
			}

			_, err = apikeys.CreateApiKey(s.db, organizationID, *encryptedApiKey, apikeys.HashKey(rawApiKey))
			if err != nil {
				return nil, err
			}

			return &rawApiKey, nil
		} else {
			return nil, err
		}
	}

	return s.cryptoService.DecryptApiKey(apiKey.ApiKey)
}

func generateApiKey() string {
	randomBytes := make([]byte, 32)
	_, err := rand.Read(randomBytes)
	if err != nil {
		panic(err)
	}
	return base64.StdEncoding.EncodeToString(randomBytes)
}
