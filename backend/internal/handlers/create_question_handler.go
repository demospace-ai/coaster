package handlers

import (
	"encoding/json"
	"fabra/internal/models"
	"fabra/internal/posts"
	"net/http"
)

type CreateQuestionRequest struct {
	QuestionTitle string `json:"question_title"`
	QuestionBody  string `json:"question_body"`
}

type CreateQuestionResponse struct {
	Post models.Post `json:"post"`
}

func CreateQuestion(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var createQuestionRequest CreateQuestionRequest
	err := decoder.Decode(&createQuestionRequest)
	if err != nil {
		return err
	}

	post, err := posts.CreateQuestion(env.Db, createQuestionRequest.QuestionTitle, createQuestionRequest.QuestionBody, env.Auth.Session.UserID)
	if err != nil {
		return err
	}

	// TODO: don't just return the raw post
	return json.NewEncoder(w).Encode(CreateQuestionResponse{
		Post: *post,
	})
}
