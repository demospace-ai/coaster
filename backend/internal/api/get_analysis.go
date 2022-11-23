package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (s ApiService) GetAnalysis(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	vars := mux.Vars(r)
	strAnalysisID, ok := vars["analysisID"]
	if !ok {
		return fmt.Errorf("missing analysis ID from GetQuetion request URL: %s", r.URL.RequestURI())
	}

	analysisID, err := strconv.ParseInt(strAnalysisID, 10, 64)
	if err != nil {
		return nil
	}

	analysis, err := analyses.LoadAnalysisByID(s.db, auth.Organization.ID, analysisID)
	if err != nil {
		return err
	}

	events, err := analyses.LoadEventsByAnalysisID(s.db, analysis.ID)
	if err != nil {
		return err
	}

	eventFilters, err := analyses.LoadEventFiltersByAnalysisID(s.db, analysis.ID)
	if err != nil {
		return err
	}

	var connection *models.DataConnection
	if analysis.ConnectionID.Valid {
		connection, err = dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, analysis.ConnectionID.Int64)
		if err != nil {
			return nil
		}
	}

	// Assert the user has access to the event set
	var eventSet *models.EventSet
	if analysis.EventSetID.Valid {
		eventSet, err = eventsets.LoadEventSetByID(s.db, auth.Organization.ID, analysis.EventSetID.Int64)
		if err != nil {
			return nil
		}
	}

	analysisView := views.ConvertAnalysis(
		analysis,
		events,
		eventFilters,
		connection,
		eventSet,
	)

	return json.NewEncoder(w).Encode(analysisView)
}
