package handlers

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/errors"
	"fabra/internal/models"
	"net/http"
)

type CreateAnalysisRequest struct {
	AnalysisType models.AnalysisType `json:"analysis_type"`
}

type CreateAnalysisResponse struct {
	Analysis models.Analysis `json:"analysis"`
}

func CreateAnalysis(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var createAnalysisRequest CreateAnalysisRequest
	err := decoder.Decode(&createAnalysisRequest)
	if err != nil {
		return err
	}

	switch createAnalysisRequest.AnalysisType {
	case models.AnalysisTypeCustomQuery:
	case models.AnalysisTypeFunnel:
		break
	default:
		return errors.NewBadRequest("must provide valid analysis type")
	}

	analysis, err := analyses.CreateAnalysis(
		env.Db,
		env.Auth.User.ID,
		env.Auth.Organization.ID,
		createAnalysisRequest.AnalysisType,
	)
	if err != nil {
		return err
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(CreateAnalysisResponse{
		Analysis: *analysis,
	})
}
