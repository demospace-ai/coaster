package handlers

import (
	"fabra/internal/analyses"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type DeleteAnalysisRequest struct {
	AnalysisID int64 `json:"analysis_id"`
}

func DeleteAnalysis(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	vars := mux.Vars(r)
	strAnalysisID, ok := vars["analysisID"]
	if !ok {
		return fmt.Errorf("missing analysis ID from DeleteQuetion request URL: %s", r.URL.RequestURI())
	}

	analysisID, err := strconv.ParseInt(strAnalysisID, 10, 64)
	if err != nil {
		return nil
	}

	return analyses.DeactivateAnalyisByID(env.Db, env.Auth.Organization.ID, analysisID)
}
