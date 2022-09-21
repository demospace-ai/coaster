package handlers

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type GetAnalysisRequest struct {
	AnalysisID int64 `json:"analysis_id"`
}

type GetAnalysisResponse struct {
	Analysis models.Analysis `json:"Analysis"`
}

func GetAnalysis(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	vars := mux.Vars(r)
	strAnalysisID, ok := vars["analysisID"]
	if !ok {
		return fmt.Errorf("missing analysis ID from GetQuetion request URL: %s", r.URL.RequestURI())
	}

	analysisID, err := strconv.ParseInt(strAnalysisID, 10, 64)
	if err != nil {
		return nil
	}

	analysis, err := analyses.LoadAnalysisByID(env.Db, analysisID, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAnalysisResponse{
		Analysis: *analysis,
	})
}
