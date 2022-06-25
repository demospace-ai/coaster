package handlers

import (
	"encoding/json"
	"fabra/internal/models"
	post_repository "fabra/internal/posts"
	"net/http"
)

type GetAssignedQuestionsResponse struct {
	Questions []models.Post `json:"questions"`
}

func GetAssignedQuestions(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	questions, err := post_repository.LoadAssignedQuestions(env.Db, env.Auth.User.ID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAssignedQuestionsResponse{
		Questions: questions,
	})
}
