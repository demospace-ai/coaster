package api

import (
	"encoding/json"
	analysis_repository "fabra/internal/analyses"
	"fabra/internal/auth"
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

func (s ApiService) GetAllAnalyses(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

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

	analyses, err := analysis_repository.LoadAllAnalyses(s.db, page, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAllAnalysesResponse{
		Analyses: analyses,
	})
}
