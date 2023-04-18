package crypto

import (
	"context"
	"fmt"

	kms "cloud.google.com/go/kms/apiv1"
	"cloud.google.com/go/kms/apiv1/kmspb"
	"github.com/golang-jwt/jwt/v5"
	"go.fabra.io/server/common/errors"
)

const JWT_SIGNING_KEY_KEY = "projects/fabra-344902/locations/global/keyRings/jwt-signing-key-keyring/cryptoKeys/jwt-signing-key-key/cryptoKeyVersions/1"

// SigningMethodKMS implements the jwt.SiginingMethod interface for Google's Cloud KMS service
type SigningMethodKMS struct {
	alg string
}

// Support for the Google Cloud KMS Asymmetric Signing Algorithms: https://cloud.google.com/kms/docs/algorithms
var (
	// SigningMethodKMSHS256 leverages Cloud KMS for the HMAC-SHA256 algorithm
	SigningMethodKMSHS256 *SigningMethodKMS
)

func init() {
	SigningMethodKMSHS256 = &SigningMethodKMS{
		"KMSHS256",
	}
	jwt.RegisterSigningMethod(SigningMethodKMSHS256.Alg(), func() jwt.SigningMethod {
		return SigningMethodKMSHS256
	})
}

func (s *SigningMethodKMS) Alg() string {
	return s.alg
}

func (s *SigningMethodKMS) Sign(signingString string, key interface{}) ([]byte, error) {
	ctx := context.Background() // TODO

	client, err := kms.NewKeyManagementClient(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create kms client")
	}
	defer client.Close()

	// Build the request.
	req := &kmspb.MacSignRequest{
		Name: JWT_SIGNING_KEY_KEY, // just always use this constant
		Data: []byte(signingString),
	}

	// Generate HMAC of data.
	result, err := client.MacSign(ctx, req)
	if err != nil {
		return nil, errors.Newf("failed to hmac sign: %v", err)
	}

	return result.Mac, nil
}

func (s *SigningMethodKMS) Verify(signingString string, signature []byte, key interface{}) error {
	ctx := context.Background() // TODO

	client, err := kms.NewKeyManagementClient(ctx)
	if err != nil {
		return fmt.Errorf("failed to create kms client: %v", err)
	}
	defer client.Close()

	// Build the request.
	req := &kmspb.MacVerifyRequest{
		Name: JWT_SIGNING_KEY_KEY, // just always use this constant
		Data: []byte(signingString),
		Mac:  signature,
	}

	// Verify the signature.
	result, err := client.MacVerify(ctx, req)
	if err != nil {
		return errors.Newf("failed to verify signature: %v", err)
	}

	if !result.Success {
		return errors.Newf("failed to verify signature: %v", result)
	}

	return nil
}
