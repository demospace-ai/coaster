package crypto

import (
	"context"
	"encoding/hex"
	"fmt"
	"hash/crc32"

	kms "cloud.google.com/go/kms/apiv1"
	kmspb "google.golang.org/genproto/googleapis/cloud/kms/v1"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

const DATA_CONNECTION_KEY = "projects/fabra-344902/locations/global/keyRings/data-connection-keyring/cryptoKeys/data-connection-key"

type CryptoService struct {
}

func NewCryptoService() CryptoService {
	return CryptoService{}
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

func (cs CryptoService) DecryptDataConnectionCredentials(credentials string) (*string, error) {
	credentialsString, err := decrypt(DATA_CONNECTION_KEY, credentials)
	if err != nil {
		return nil, err
	}

	return credentialsString, nil
}

func (cs CryptoService) EncryptDataConnectionCredentials(credentials string) (*string, error) {
	encryptedCredentials, err := encrypt(DATA_CONNECTION_KEY, credentials)
	if err != nil {
		return nil, err
	}

	return encryptedCredentials, nil
}
