package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/query"
	"fabra/internal/views"
	"net/http"
)

type RunFunnelQueryRequest struct {
	ConnectionID int64 `json:"connection_id"`
	AnalysisID   int64 `json:"analysis_id"`
}

type RunFunnelQueryResponse struct {
	Success      bool         `json:"success"`
	ErrorMessage string       `json:"error_message"`
	Schema       views.Schema `json:"schema"`
	QueryResults []views.Row  `json:"query_results"`
}

func (s ApiService) RunFunnelQuery(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var runFunnelQueryRequest RunFunnelQueryRequest
	err := decoder.Decode(&runFunnelQueryRequest)
	if err != nil {
		return err
	}

	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, runFunnelQueryRequest.ConnectionID)
	if err != nil {
		return err
	}

	analysis, err := analyses.LoadAnalysisByID(s.db, auth.Organization.ID, runFunnelQueryRequest.AnalysisID)
	if err != nil {
		return err
	}

	schema, queryResults, err := s.queryService.RunFunnelQuery(dataConnection, analysis)
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
		Success:      true,
		Schema:       schema,
		QueryResults: queryResults,
	})
}
