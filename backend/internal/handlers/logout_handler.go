package handlers

import (
	"fabra/internal/sessions"
	"net/http"
)

func Logout(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		return nil
	}

	return sessions.Clear(env.Db, env.Auth.Session)
}
