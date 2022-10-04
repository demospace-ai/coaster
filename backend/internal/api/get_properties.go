package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fabra/internal/views"
	"fmt"
	"net/http"
	"strconv"
)

type GetPropertiesResponse struct {
	PropertyGroups []views.PropertyGroup `json:"property_groups"`
}

func (s ApiService) GetProperties(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetProperties request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return nil
	}

	strEventSetID := r.URL.Query().Get("eventSetID")
	if len(strEventSetID) == 0 {
		return fmt.Errorf("missing event set ID from GetProperties request URL: %s", r.URL.RequestURI())
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

	propertyGroups, err := s.queryService.GetProperties(dataConnection, eventSet)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetPropertiesResponse{
		PropertyGroups: propertyGroups,
	})
}
