package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/customer_models"
)

type GetModelsResponse struct {
	Models []models.Model `json:"models"`
}

func (s ApiService) GetModels(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	models, err := customer_models.LoadAllModels(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetModelsResponse{
		models,
	})
}
