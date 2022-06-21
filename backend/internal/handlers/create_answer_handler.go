package handlers

import (
	"encoding/json"
	"fabra/internal/models"
	"fabra/internal/posts"
	"net/http"
)

type CreateAnswerRequest struct {
	QuestionID int64  `json:"question_id"`
	AnswerBody string `json:"answer_body"`
}

type CreateAnswerResponse struct {
	Question models.Post   `json:"question"`
	Answers  []models.Post `json:"answers"`
}

func CreateAnswer(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var createAnswerRequest CreateAnswerRequest
	err := decoder.Decode(&createAnswerRequest)
	if err != nil {
		return err
	}

	_, err = posts.CreateAnswer(env.Db, createAnswerRequest.QuestionID, createAnswerRequest.AnswerBody, env.Auth.User.ID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	// refetch the question and answers now
	question, err := posts.LoadQuestionByID(env.Db, createAnswerRequest.QuestionID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	answers, err := posts.LoadAnswersByQuestionID(env.Db, createAnswerRequest.QuestionID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	// TODO: don't just return the raw post
	return json.NewEncoder(w).Encode(CreateAnswerResponse{
		Question: *question,
		Answers:  answers,
	})
}
