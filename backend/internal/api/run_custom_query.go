package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"net/http"
)

type RunQueryRequest struct {
	AnalysisID int64 `json:"analysis_id"`
}

func (s ApiService) RunCustomQuery(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var runQueryRequest RunQueryRequest
	err := decoder.Decode(&runQueryRequest)
	if err != nil {
		return err
	}

	// This should prevent unauthorized access to the wrong data connection
	analysis, err := analyses.LoadAnalysisByID(s.db, auth.Organization.ID, runQueryRequest.AnalysisID)
	if err != nil {
		return err
	}

	queryResult, err := s.queryService.RunCustomQuery(analysis)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(*queryResult)
}
