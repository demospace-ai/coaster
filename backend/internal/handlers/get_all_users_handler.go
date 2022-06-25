package handlers

import (
	"encoding/json"
	"fabra/internal/models"
	user_repository "fabra/internal/users"
	"net/http"
)

type GetAllUsersResponse struct {
	Users []models.User `json:"users"`
}

func GetAllUsers(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	users, err := user_repository.LoadAllByOrganizationID(env.Db, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAllUsersResponse{
		Users: users,
	})
}
