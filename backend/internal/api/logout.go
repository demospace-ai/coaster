package api

import (
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/repositories/sessions"
)

func (s ApiService) Logout(a auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !a.IsAuthenticated {
		return nil
	}

	auth.DeleteSessionCookie(w)
	return sessions.Clear(s.db, a.Session)
}
