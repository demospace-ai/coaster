package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/query"
	"fabra/internal/views"
	"net/http"
)

type RunQueryRequest struct {
	AnalysisID int64 `json:"analysis_id"`
}

type RunQueryResponse struct {
	Success      bool              `json:"success"`
	ErrorMessage string            `json:"error_message"`
	QueryResult  views.QueryResult `json:"query_result"`
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
		if _, ok := err.(query.Error); ok {
			// Not actually a failure, the user's query was just wrong. Send the details back to them.
			return json.NewEncoder(w).Encode(RunQueryResponse{
				Success:      false,
				ErrorMessage: err.Error(),
			})
		} else {
			return err
		}
	}

	return json.NewEncoder(w).Encode(RunQueryResponse{
		Success:     true,
		QueryResult: *queryResult,
	})
}
