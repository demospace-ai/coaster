package crypto

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"hash/crc32"

	kms "cloud.google.com/go/kms/apiv1"
	"cloud.google.com/go/kms/apiv1/kmspb"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

type CryptoService interface {
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

func GenerateSigningKey() string {
	randomBytes := make([]byte, 32)
	_, err := rand.Read(randomBytes)
	if err != nil {
		panic(err)
	}
	return base64.StdEncoding.EncodeToString(randomBytes)
}

func encrypt(keyName string, plaintextString string) (*string, error) {
	// TODO: encrypt with local keys here
	// don't encrypt in dev
	if !application.IsProd() {
		hexEncoded := hex.EncodeToString([]byte(plaintextString))
		return &hexEncoded, nil
	}

	ctx := context.Background()
	client, err := kms.NewKeyManagementClient(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "(crypto.encrypt) failed to create kms client")
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
		return nil, errors.Wrap(err, "(crypto.encrypt) failed to encrypt")
	}

	if !result.VerifiedPlaintextCrc32C {
		return nil, errors.Newf("(crypto.encrypt) request corrupted in-transit")
	}
	if int64(crc32c(result.Ciphertext)) != result.CiphertextCrc32C.Value {
		return nil, errors.Newf("(crypto.encrypt) response corrupted in-transit")
	}

	ciphertext := hex.EncodeToString(result.Ciphertext)
	return &ciphertext, nil
}

func decrypt(keyName string, ciphertextString string) (*string, error) {
	ciphertext, err := hex.DecodeString(ciphertextString)
	if err != nil {
		return nil, errors.Wrap(err, "(crypto.decrypt)")
	}

	// TODO: decrypt with local keys here
	// don't encrypt in dev
	if !application.IsProd() {
		ciphertextStr := string(ciphertext)
		return &ciphertextStr, nil
	}

	ctx := context.Background()
	client, err := kms.NewKeyManagementClient(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "(crypto.decrypt) failed to create kms client")
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
		return nil, errors.Wrap(err, "(crypto.decrypt) failed to decrypt ciphertext")
	}

	if int64(crc32c(result.Plaintext)) != result.PlaintextCrc32C.Value {
		return nil, errors.Newf("(crypto.decrypt) response corrupted in-transit")
	}

	plaintext := string(result.Plaintext)
	return &plaintext, nil
}
