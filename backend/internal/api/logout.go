package api

import (
	"fabra/internal/auth"
	"fabra/internal/sessions"
	"net/http"
)

func (s Service) Logout(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !auth.IsAuthenticated {
		return nil
	}

	return sessions.Clear(s.db, auth.Session)
}
