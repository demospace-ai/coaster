package auth

import (
	"net/http"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/sessions"
	"go.fabra.io/server/common/repositories/users"

	"gorm.io/gorm"
)

const SESSION_COOKIE_NAME = "X-Session-Token"

type AuthService interface {
	GetAuthentication(r *http.Request) (*Authentication, error)
}

type AuthServiceImpl struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) AuthService {
	return AuthServiceImpl{
		db: db,
	}
}

func addCookie(w http.ResponseWriter, name string, value string) {
	domain := "trycoaster.com"
	if !application.IsProd() {
		domain = "localhost"
	}
	cookie := http.Cookie{
		Name:     name,
		Value:    value,
		Secure:   application.IsProd(), // disable secure for local testing
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Domain:   domain, // share cookies across subdomains
	}
	http.SetCookie(w, &cookie)
}

func deleteCookie(w http.ResponseWriter, name string) {
	domain := "trycoaster.com"
	if !application.IsProd() {
		domain = "localhost"
	}
	cookie := http.Cookie{
		Name:     name,
		Value:    "",
		Secure:   application.IsProd(), // disable secure for local testing
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Domain:   domain, // share cookies across subdomains
		MaxAge:   -1,
	}
	http.SetCookie(w, &cookie)
}

func AddSessionCookie(w http.ResponseWriter, token string) {
	addCookie(w, SESSION_COOKIE_NAME, token)
}

func DeleteSessionCookie(w http.ResponseWriter) {
	deleteCookie(w, SESSION_COOKIE_NAME)
}

func (as AuthServiceImpl) authenticateCookie(r *http.Request) (*Authentication, error) {
	cookie, err := r.Cookie(SESSION_COOKIE_NAME)
	if err != nil {
		if errors.IsCookieNotFound(err) {
			// this just means that the authentication failed, not unexpected
			return &Authentication{
				IsAuthenticated: false,
			}, nil
		} else {
			return nil, errors.Wrap(err, "(auth.authenticateCookie)")
		}
	}

	session, err := sessions.LoadValidByToken(as.db, cookie.Value)
	if err != nil {
		if errors.IsRecordNotFound(err) {
			// this just means that the authentication failed, not unexpected
			return &Authentication{
				IsAuthenticated: false,
			}, nil
		} else {
			return nil, errors.Wrap(err, "(auth.authenticateCookie)")
		}
	}

	refreshed, err := sessions.Refresh(as.db, session)
	if err != nil {
		return nil, errors.Wrap(err, "(auth.authenticateCookie)")
	}

	user, err := users.LoadUserByID(as.db, session.UserID)
	if err != nil {
		return nil, errors.Wrap(err, "(auth.authenticateCookie) Unexpected error fetching user")
	}

	if user.Blocked {
		return nil, errors.Wrap(errors.Forbidden, "(auth.authenticateCookie)")
	}

	return &Authentication{
		Session:         refreshed,
		User:            user,
		IsAuthenticated: true,
	}, nil
}

func (as AuthServiceImpl) GetAuthentication(r *http.Request) (*Authentication, error) {
	authentication, err := as.authenticateCookie(r)
	if err != nil {
		return nil, errors.Wrap(err, "(auth.GetAuthentication)")
	}

	if authentication.IsAuthenticated {
		return authentication, nil
	}

	return &Authentication{
		IsAuthenticated: false,
	}, nil
}
