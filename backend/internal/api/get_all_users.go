package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/models"
	user_repository "fabra/internal/users"
	"net/http"
)

type GetAllUsersResponse struct {
	Users []models.User `json:"users"`
}

func (s Service) GetAllUsers(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("cannot request users without organization")
	}

	users, err := user_repository.LoadAllByOrganizationID(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAllUsersResponse{
		Users: users,
	})
}
