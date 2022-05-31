package handlers

import (
	"encoding/json"
	"net/http"
)

type CheckSessionResponse struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func CheckSession(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	return json.NewEncoder(w).Encode(CheckSessionResponse{
		FirstName: env.Auth.User.FirstName,
		LastName:  env.Auth.User.LastName,
	})
}
