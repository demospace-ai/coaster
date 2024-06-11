package oauth

import (
	"context"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.coaster.io/server/common/application"
	"go.coaster.io/server/common/crypto"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/secret"
	"golang.org/x/oauth2"
	"google.golang.org/api/idtoken"

	googleoauth "golang.org/x/oauth2/google"
)

const GOOGLE_PRODUCTION_CLIENT_ID = "454026596701-bcsu6bfr36alkdpcq7im8rjgmm2cgcnl.apps.googleusercontent.com"
const GOOGLE_PRODUCTION_SECRET_KEY = "projects/454026596701/secrets/google-prod-client-secret/versions/latest"
const GOOGLE_DEVELOPMENT_CLIENT_ID = "86315250181-v19knnmf486fb5nebm2b47hu454abvet.apps.googleusercontent.com"
const GOOGLE_DEVELOPMENT_SECRET_KEY = "projects/86315250181/secrets/google-dev-client-secret/versions/latest"

type StateClaims struct {
	Origin   string        `json:"origin"`
	Provider OauthProvider `json:"provider"`
	jwt.RegisteredClaims
}

type OauthProvider string

const (
	OauthProviderGoogle  OauthProvider = "google"
	OauthProviderUnknown OauthProvider = "unknown"
)

type ExternalUserInfo struct {
	ExternalID        string
	OauthProvider     OauthProvider
	Email             string
	FirstName         string
	LastName          string
	ProfilePictureURL string
}

func FetchGoogleInfo(code string) (*ExternalUserInfo, error) {
	secretKey := getGoogleSecretKey()
	googleClientSecret, err := secret.FetchSecret(context.TODO(), secretKey)
	if err != nil {
		return nil, errors.Wrap(err, "(oauth.FetchGoogleInfo) fetching secret")
	}

	clientId := getGoogleClientID()
	oauthConf := &oauth2.Config{
		ClientID:     clientId,
		ClientSecret: *googleClientSecret,
		Scopes:       []string{"email", "profile", "openid"},
		RedirectURL:  getOauthRedirectUrl(),
		Endpoint:     googleoauth.Endpoint,
	}

	oauth2Token, err := oauthConf.Exchange(context.TODO(), code)
	if err != nil {
		return nil, errors.Wrap(err, "(oauth.FetchGoogleInfo) exchanging code for token")
	}

	// Extract the ID Token from OAuth2 token.
	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		return nil, errors.Newf("(oauth.FetchGoogleInfo) no id_token included in token exchange response: %+v", oauth2Token)
	}

	validator, err := idtoken.NewValidator(context.TODO())
	if err != nil {
		return nil, errors.Wrap(err, "(oauth.FetchGoogleInfo) creating validator")
	}

	payload, err := validator.Validate(context.TODO(), rawIDToken, clientId)
	if err != nil {
		return nil, errors.Wrap(err, "(oauth.FetchGoogleInfo) validating token")
	}

	return &ExternalUserInfo{
		ExternalID:        payload.Subject,
		OauthProvider:     OauthProviderGoogle,
		Email:             payload.Claims["email"].(string),
		FirstName:         payload.Claims["given_name"].(string),
		LastName:          payload.Claims["family_name"].(string),
		ProfilePictureURL: payload.Claims["picture"].(string),
	}, nil
}

func GetOauthRedirect(origin string, strProvider string) (*string, error) {
	provider := getOAuthProvider(strProvider)

	var oauthConf *oauth2.Config
	switch provider {
	case OauthProviderGoogle:
		oauthConf = &oauth2.Config{
			ClientID:    getGoogleClientID(),
			Scopes:      []string{"email", "profile", "openid"},
			RedirectURL: getOauthRedirectUrl(),
			Endpoint:    googleoauth.Endpoint,
		}
	default:
		return nil, errors.Newf("unsupported login method: %s", strProvider)
	}

	token := jwt.NewWithClaims(crypto.SigningMethodKMSHS256, StateClaims{
		origin,
		provider,
		jwt.RegisteredClaims{
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	})

	signedString, err := token.SignedString(nil)
	if err != nil {
		return nil, errors.Wrap(err, "(oauth.GetOauthRedirect) signing token")
	}

	url := oauthConf.AuthCodeURL(signedString, oauth2.AccessTypeOnline, oauth2.ApprovalForce)

	return &url, nil
}

func ValidateState(state string) (*OauthProvider, *string, error) {
	token, err := jwt.ParseWithClaims(state, &StateClaims{}, func(token *jwt.Token) (interface{}, error) {
		return nil, nil // no key needs to be fetched— we just call the GCP KMS endpoint
	})

	if err != nil {
		return nil, nil, errors.Wrap(err, "(oauth.ValidateState) parsing token")
	}

	if !token.Valid {
		return nil, nil, errors.Newf("token invalid: %v", token.Raw)
	}

	claims, ok := token.Claims.(*StateClaims)
	if !ok {
		return nil, nil, errors.Newf("token invalid: %v", token.Raw)
	}

	return &claims.Provider, &claims.Origin, nil
}

func getGoogleSecretKey() string {
	if application.IsProd() {
		return GOOGLE_PRODUCTION_SECRET_KEY
	} else {
		return GOOGLE_DEVELOPMENT_SECRET_KEY
	}
}

func getGoogleClientID() string {
	if application.IsProd() {
		return GOOGLE_PRODUCTION_CLIENT_ID
	} else {
		return GOOGLE_DEVELOPMENT_CLIENT_ID
	}
}

func getOauthRedirectUrl() string {
	if application.IsProd() {
		return "https://api.trycoaster.com/oauth_login"
	} else {
		return "http://localhost:8080/oauth_login"
	}
}

func getOAuthProvider(strProvider string) OauthProvider {
	switch strings.ToLower(strProvider) {
	case "google":
		return OauthProviderGoogle
	default:
		return OauthProviderUnknown
	}
}
