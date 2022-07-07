package handlers

import (
	"encoding/json"
	"fabra/internal/errors"
	"fabra/internal/models"
	post_repository "fabra/internal/posts"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type GetAllQuestionsRequest struct {
	Page *int `json:"page,omitempty"`
}

type GetAllQuestionsResponse struct {
	Questions []models.Post `json:"questions"`
}

func GetAllQuestions(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	page := 0
	vars := mux.Vars(r)
	pageParam, ok := vars["page"]
	if ok {
		pageInt, err := strconv.Atoi(pageParam)
		if err != nil {
			return errors.BadRequest
		}

		page = pageInt
	}

	questions, err := post_repository.LoadAllQuestions(env.Db, page, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAssignedQuestionsResponse{
		Questions: questions,
	})
}
