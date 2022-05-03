package handlers

import (
	"encoding/json"
	"net/http"
)

type SearchRequest struct {
	SearchQuery *string `json:"search_query,omitempty"`
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

	return nil
}
