package handlers

import (
	"encoding/json"
	"fabra/internal/models"
	"net/http"
)

type CheckSessionResponse struct {
	User         models.User          `json:"user"`
	Organization *models.Organization `json:"organization"`
}

func CheckSession(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	return json.NewEncoder(w).Encode(CheckSessionResponse{
		User:         *env.Auth.User,
		Organization: env.Auth.Organization,
	})
}
