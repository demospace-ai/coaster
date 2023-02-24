package crypto

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"hash/crc32"

	kms "cloud.google.com/go/kms/apiv1"
	"cloud.google.com/go/kms/apiv1/kmspb"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

const CONNECTION_KEY = "projects/fabra-344902/locations/global/keyRings/data-connection-keyring/cryptoKeys/data-connection-key"
const API_KEY_KEY = "projects/fabra-344902/locations/global/keyRings/api-key-keyring/cryptoKeys/api-key-key"

type CryptoService interface {
	DecryptConnectionCredentials(encryptedCredentials string) (*string, error)
	EncryptConnectionCredentials(credentials string) (*string, error)
	DecryptApiKey(encryptedApiKey string) (*string, error)
	EncryptApiKey(apiKey string) (*string, error)
}

type CryptoServiceImpl struct {
}

func NewCryptoService() CryptoService {
	return CryptoServiceImpl{}
}

func HashString(input string) string {
	h := sha256.Sum256([]byte(input))
	return base64.StdEncoding.EncodeToString(h[:])
}

func encrypt(keyName string, plaintextString string) (*string, error) {
	ctx := context.Background()
	client, err := kms.NewKeyManagementClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create kms client: %v", err)
	}
	defer client.Close()

	plaintext := []byte(plaintextString)

	crc32c := func(data []byte) uint32 {
		t := crc32.MakeTable(crc32.Castagnoli)
		return crc32.Checksum(data, t)
	}
	plaintextCRC32C := crc32c(plaintext)

	req := &kmspb.EncryptRequest{
		Name:            keyName,
		Plaintext:       plaintext,
		PlaintextCrc32C: wrapperspb.Int64(int64(plaintextCRC32C)),
	}

	result, err := client.Encrypt(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt: %v", err)
	}

	if !result.VerifiedPlaintextCrc32C {
		return nil, fmt.Errorf("encrypt: request corrupted in-transit")
	}
	if int64(crc32c(result.Ciphertext)) != result.CiphertextCrc32C.Value {
		return nil, fmt.Errorf("encrypt: response corrupted in-transit")
	}

	ciphertext := hex.EncodeToString(result.Ciphertext)
	return &ciphertext, nil
}

func decrypt(keyName string, ciphertextString string) (*string, error) {
	ciphertext, err := hex.DecodeString(ciphertextString)
	if err != nil {
		return nil, err
	}

	ctx := context.Background()
	client, err := kms.NewKeyManagementClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create kms client: %v", err)
	}
	defer client.Close()

	crc32c := func(data []byte) uint32 {
		t := crc32.MakeTable(crc32.Castagnoli)
		return crc32.Checksum(data, t)
	}
	ciphertextCRC32C := crc32c(ciphertext)

	req := &kmspb.DecryptRequest{
		Name:             keyName,
		Ciphertext:       ciphertext,
		CiphertextCrc32C: wrapperspb.Int64(int64(ciphertextCRC32C)),
	}

	result, err := client.Decrypt(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt ciphertext: %v", err)
	}

	if int64(crc32c(result.Plaintext)) != result.PlaintextCrc32C.Value {
		return nil, fmt.Errorf("decrypt: response corrupted in-transit")
	}

	plaintext := string(result.Plaintext)
	return &plaintext, nil
}

func (cs CryptoServiceImpl) DecryptConnectionCredentials(encryptedCredentials string) (*string, error) {
	credentials, err := decrypt(CONNECTION_KEY, encryptedCredentials)
	if err != nil {
		return nil, err
	}

	return credentials, nil
}

func (cs CryptoServiceImpl) EncryptConnectionCredentials(credentials string) (*string, error) {
	encryptedCredentials, err := encrypt(CONNECTION_KEY, credentials)
	if err != nil {
		return nil, err
	}

	return encryptedCredentials, nil
}

func (cs CryptoServiceImpl) DecryptApiKey(encryptedApiKey string) (*string, error) {
	apiKey, err := decrypt(API_KEY_KEY, encryptedApiKey)
	if err != nil {
		return nil, err
	}

	return apiKey, nil
}

func (cs CryptoServiceImpl) EncryptApiKey(apiKey string) (*string, error) {
	encryptedApiKey, err := encrypt(API_KEY_KEY, apiKey)
	if err != nil {
		return nil, err
	}

	return encryptedApiKey, nil
}
