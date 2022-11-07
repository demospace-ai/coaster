package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"net/http"
)

type RunTrendQueryRequest struct {
	AnalysisID int64 `json:"analysis_id"`
}

func (s ApiService) RunTrendQuery(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var runFunnelQueryRequest RunTrendQueryRequest
	err := decoder.Decode(&runFunnelQueryRequest)
	if err != nil {
		return err
	}

	// This should prevent unauthorized access to the wrong data connection
	analysis, err := analyses.LoadAnalysisByID(s.db, auth.Organization.ID, runFunnelQueryRequest.AnalysisID)
	if err != nil {
		return err
	}

	queryResults, err := s.queryService.RunTrendQuery(analysis)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(queryResults)
}
