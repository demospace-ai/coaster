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

type GetPropertyValuesResponse struct {
	PropertyValues []views.Value `json:"property_values"`
}

func (s ApiService) GetPropertyValues(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetPropertyValues request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return nil
	}

	strEventSetID := r.URL.Query().Get("eventSetID")
	if len(strEventSetID) == 0 {
		return fmt.Errorf("missing event set ID from GetPropertyValues request URL: %s", r.URL.RequestURI())
	}

	eventSetID, err := strconv.ParseInt(strEventSetID, 10, 64)
	if err != nil {
		return nil
	}

	propertyName := r.URL.Query().Get("propertyName")
	if len(strEventSetID) == 0 {
		return fmt.Errorf("missing property name from GetPropertyValues request URL: %s", r.URL.RequestURI())
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

	// TODO: support getting property values for custom property group
	propertyValues, err := s.queryService.GetPropertyValues(dataConnection, eventSet, propertyName)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetPropertyValuesResponse{
		PropertyValues: propertyValues,
	})
}
