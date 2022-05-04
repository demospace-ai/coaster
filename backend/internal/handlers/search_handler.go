package handlers

import (
	"encoding/json"
	"fabra/internal/models"
	"fabra/internal/posts"
	"net/http"
)

const TSVECTOR = "(setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', body), 'B'))"

type SearchRequest struct {
	SearchQuery string `json:"search_query"`
}

type SearchResponse struct {
	Posts []models.Post `json:"posts,omitempty"`
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

	posts, err := posts.Search(env.Db, searchRequest.SearchQuery)
	if err != nil {
		return err
	}

	// TODO: don't just return the raw post list
	return json.NewEncoder(w).Encode(SearchResponse{
		Posts: posts,
	})
}
