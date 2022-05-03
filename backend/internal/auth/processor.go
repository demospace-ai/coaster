package auth

import (
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/sessions"
	"net/http"

	"gorm.io/gorm"
)

const SESSION_COOKIE_NAME = "X-Session-Token"

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

func authenticate(db *gorm.DB, r *http.Request) (*models.Session, error) {
	cookie, err := r.Cookie(SESSION_COOKIE_NAME)
	if err != nil {
		return nil, err
	}

	session, err := sessions.LoadValidByToken(db, cookie.Value)
	if err != nil {
		return nil, err
	}

	refreshed, err := sessions.Refresh(db, session)
	if err != nil {
		return nil, err
	}

	return refreshed, nil
}

func GetAuthentication(db *gorm.DB, r *http.Request) (*Authentication, error) {
	session, err := authenticate(db, r)
	if err != nil && !errors.IsRecordNotFound(err) && !errors.IsCookieNotFound(err) {
		return nil, errors.Wrap(err, "Unexpected error checking authentication")
	}

	return &Authentication{
		Session:         session,
		IsAuthenticated: err == nil,
	}, nil
}
