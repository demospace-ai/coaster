package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/customermodels"
	"fabra/internal/models"
	"net/http"
)

type GetModelsResponse struct {
	Models []models.Model `json:"models"`
}

func (s ApiService) GetModels(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	models, err := customermodels.LoadAllModels(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetModelsResponse{
		models,
	})
}
