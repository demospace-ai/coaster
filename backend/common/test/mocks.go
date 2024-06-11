package test

import (
	"net/http"

	"go.coaster.io/server/common/auth"
)

type MockAuthService struct {
}

func (as MockAuthService) GetAuthentication(r *http.Request) (*auth.Authentication, error) {
	return &auth.Authentication{}, nil
}

type MockCryptoService struct {
}
