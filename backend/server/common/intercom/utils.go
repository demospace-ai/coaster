package intercom

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/secret"
)

const INTERCOM_SECRET_KEY_KEY = "projects/932264813910/secrets/intercom-private-key/versions/latest"

func GenerateIntercomHash(user models.User) (*string, error) {
	hashKey, err := secret.FetchSecret(context.TODO(), INTERCOM_SECRET_KEY_KEY)
	if err != nil {
		return nil, err
	}

	h := hmac.New(sha256.New, []byte(*hashKey))

	_, err = h.Write([]byte(fmt.Sprintf("%d", user.ID)))
	if err != nil {
		return nil, err
	}

	// Get result and encode as hexadecimal string
	sha := hex.EncodeToString(h.Sum(nil))

	return &sha, nil
}
