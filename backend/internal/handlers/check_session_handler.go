package handlers

import (
	"encoding/json"
	"fabra/internal/user_identities"
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

	userIdentity, err := user_identities.LoadByUserID(env.Db, env.Auth.Session.UserID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CheckSessionResponse{
		FirstName: userIdentity.FirstName,
		LastName:  userIdentity.LastName,
	})
}
