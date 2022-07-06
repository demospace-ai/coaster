package handlers

import (
	"encoding/json"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/posts"
	"net/http"
)

type CreateQuestionRequest struct {
	QuestionTitle  string `json:"question_title"`
	QuestionBody   string `json:"question_body"`
	AssignedUserID *int64 `json:"assigned_user_id,omitempty"`
}

type CreateQuestionResponse struct {
	Question models.Post `json:"question"`
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

	if len(createQuestionRequest.QuestionTitle) == 0 {
		return errors.NewBadRequest("must provide question title")
	}

	post, err := posts.CreateQuestion(
		env.Db,
		createQuestionRequest.QuestionTitle,
		createQuestionRequest.QuestionBody,
		env.Auth.User.ID,
		env.Auth.Organization.ID,
		createQuestionRequest.AssignedUserID,
	)
	if err != nil {
		return err
	}

	// TODO: don't just return the raw post
	return json.NewEncoder(w).Encode(CreateQuestionResponse{
		Question: *post,
	})
}
