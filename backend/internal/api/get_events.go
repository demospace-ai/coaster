package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fmt"
	"net/http"
	"strconv"
)

type GetEventsResponse struct {
	Events []string `json:"events"`
}

func (s ApiService) GetEvents(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetEvents request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return nil
	}

	strEventSetID := r.URL.Query().Get("eventSetID")
	if len(strEventSetID) == 0 {
		return fmt.Errorf("missing event set ID from GetEvents request URL: %s", r.URL.RequestURI())
	}

	eventSetID, err := strconv.ParseInt(strEventSetID, 10, 64)
	if err != nil {
		return nil
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	eventSet, err := eventsets.LoadEventSetByID(s.db, auth.Organization.ID, eventSetID)
	if err != nil {
		return err
	}

	events, err := s.queryService.GetEvents(*dataConnection, *eventSet)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetEventsResponse{
		Events: events,
	})
}
