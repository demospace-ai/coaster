package handlers

import (
	"database/sql"
	"encoding/json"
	"fabra/internal/models"
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

	var posts []models.Post
	env.Db.Raw(
		"SELECT *, ts_rank((setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', body), 'B')), @query) as rank FROM posts WHERE (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', body), 'B')) @@ to_tsquery('english', @query) ORDER BY rank desc",
		sql.Named("query", searchRequest.SearchQuery)).
		Scan(&posts)

	return json.NewEncoder(w).Encode(SearchResponse{
		Posts: posts,
	})
}
