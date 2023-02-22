package auth

import (
	"net/http"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/api_keys"
	"go.fabra.io/server/common/repositories/organizations"
	"go.fabra.io/server/common/repositories/sessions"
	"go.fabra.io/server/common/repositories/users"

	"gorm.io/gorm"
)

const SESSION_COOKIE_NAME = "X-Session-Token"

type AuthService interface {
	GetAuthentication(r *http.Request) (*Authentication, error)
}

type AuthServiceImpl struct {
	db            *gorm.DB
	cryptoService crypto.CryptoService
}

func NewAuthService(db *gorm.DB, cryptoService crypto.CryptoService) AuthService {
	return AuthServiceImpl{
		db:            db,
		cryptoService: cryptoService,
	}
}

func addCookie(w http.ResponseWriter, name string, value string) {
	cookie := http.Cookie{
		Name:     name,
		Value:    value,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	}
	http.SetCookie(w, &cookie)
}

func AddSessionCookie(w http.ResponseWriter, token string) {
	addCookie(w, SESSION_COOKIE_NAME, token)
}

func (as AuthServiceImpl) authenticate(r *http.Request) (*models.Session, error) {
	cookie, err := r.Cookie(SESSION_COOKIE_NAME)
	if err != nil {
		return nil, err
	}

	session, err := sessions.LoadValidByToken(as.db, cookie.Value)
	if err != nil {
		return nil, err
	}

	refreshed, err := sessions.Refresh(as.db, session)
	if err != nil {
		return nil, err
	}

	return refreshed, nil
}

func (as AuthServiceImpl) authApiKey(r *http.Request) (*models.Organization, error) {
	apiKey := r.Header.Get("X-API-KEY")
	if apiKey != "" {
		hashedKey := api_keys.HashKey(apiKey)
		organization, err := organizations.LoadOrganizationByApiKey(as.db, hashedKey)
		if err != nil {
			return nil, err
		}

		return organization, nil
	} else {
		return nil, nil
	}
}

func (as AuthServiceImpl) GetAuthentication(r *http.Request) (*Authentication, error) {
	session, err := as.authenticate(r)

	// no session found
	if errors.IsRecordNotFound(err) || errors.IsCookieNotFound(err) {
		// check for API key authentication too
		organization, err := as.authApiKey(r)
		if err != nil && !errors.IsRecordNotFound(err) {
			return nil, err
		}

		return &Authentication{
			Session:         nil,
			User:            nil,
			Organization:    organization,
			IsAuthenticated: organization != nil,
		}, nil
	}

	// other unexpected error
	if err != nil {
		return nil, errors.Wrap(err, "Unexpected error checking authentication")
	}

	user, err := users.LoadUserByID(as.db, session.UserID)
	if err != nil {
		return nil, errors.Wrap(err, "Unexpected error fetching user")
	}

	// If organization is null, this means the user still needs to set their organization
	var organization *models.Organization
	if user.OrganizationID.Valid {
		organization, err = organizations.LoadOrganizationByID(as.db, user.OrganizationID.Int64)
		if err != nil {
			return nil, errors.Wrap(err, "Unexpected error fetching organization")
		}
	}

	return &Authentication{
		Session:         session,
		User:            user,
		Organization:    organization,
		IsAuthenticated: err == nil,
	}, nil
}
