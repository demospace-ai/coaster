package handlers

import (
	"encoding/json"
	"fabra/internal/models"
	"fabra/internal/posts"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type GetQuestionRequest struct {
	QuestionID int64 `json:"question_id"`
}

type GetQuestionResponse struct {
	Question models.Post   `json:"question"`
	Answers  []models.Post `json:"answers"`
}

func GetQuestion(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	vars := mux.Vars(r)
	strQuestionID, ok := vars["questionID"]
	if !ok {
		return fmt.Errorf("missing question ID from GetQuetion request URL: %s", r.URL.RequestURI())
	}

	questionID, err := strconv.ParseInt(strQuestionID, 10, 64)
	if err != nil {
		return nil
	}

	question, err := posts.LoadQuestionByID(env.Db, questionID)
	if err != nil {
		return err
	}

	answers, err := posts.LoadAnswersByQuestionID(env.Db, questionID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetQuestionResponse{
		Question: *question,
		Answers:  answers,
	})
}
