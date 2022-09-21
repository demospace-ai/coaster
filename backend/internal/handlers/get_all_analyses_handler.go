package handlers

import (
	"encoding/json"
	analysis_repository "fabra/internal/analyses"
	"fabra/internal/errors"
	"fabra/internal/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type GetAllAnalysesRequest struct {
	Page *int `json:"page,omitempty"`
}

type GetAllAnalysesResponse struct {
	Analyses []models.Analysis `json:"analyses"`
}

func GetAllAnalyses(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	page := 0
	vars := mux.Vars(r)
	pageParam, ok := vars["page"]
	if ok {
		pageInt, err := strconv.Atoi(pageParam)
		if err != nil {
			return errors.BadRequest
		}

		page = pageInt
	}

	analyses, err := analysis_repository.LoadAllAnalyses(env.Db, page, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAllAnalysesResponse{
		Analyses: analyses,
	})
}
