package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/models"
	"net/http"
)

type SearchRequest struct {
	SearchQuery string `json:"search_query"`
}

type SearchResponse struct {
	Analyses []models.Analysis `json:"analyses"`
}

func (s Service) Search(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var searchRequest SearchRequest
	err := decoder.Decode(&searchRequest)
	if err != nil {
		return err
	}

	analyses, err := analyses.Search(s.db, searchRequest.SearchQuery, auth.Organization.ID)
	if err != nil {
		return err
	}

	// Make JSON encode an empty string rather than null
	if len(analyses) == 0 {
		analyses = []models.Analysis{}
	}

	// TODO: don't just return the raw post list
	return json.NewEncoder(w).Encode(SearchResponse{
		Analyses: analyses,
	})
}
