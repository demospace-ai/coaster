package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/query"
	"net/http"
)

type RunQueryRequest struct {
	ConnectionID int64  `json:"connection_id"`
	QueryString  string `json:"query_string"`
}

type RunQueryResponse struct {
	Success      bool         `json:"success"`
	ErrorMessage string       `json:"error_message"`
	Schema       query.Schema `json:"schema"`
	QueryResults []query.Row  `json:"query_results"`
}

func (s ApiService) RunQuery(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var runQueryRequest RunQueryRequest
	err := decoder.Decode(&runQueryRequest)
	if err != nil {
		return err
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, runQueryRequest.ConnectionID)
	if err != nil {
		return err
	}

	schema, queryResults, err := s.queryService.RunQuery(*dataConnection, runQueryRequest.QueryString)
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
