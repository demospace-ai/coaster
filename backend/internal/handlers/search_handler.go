package handlers

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/models"
	"net/http"
)

type SearchRequest struct {
	SearchQuery string `json:"search_query"`
}

type SearchResponse struct {
	Analyses []models.Analysis `json:"analyses"`
}

func Search(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var searchRequest SearchRequest
	err := decoder.Decode(&searchRequest)
	if err != nil {
		return err
	}

	analyses, err := analyses.Search(env.Db, searchRequest.SearchQuery, env.Auth.Organization.ID)
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
