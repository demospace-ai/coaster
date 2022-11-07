package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"net/http"

	"gorm.io/gorm"
)

type UpdateAnalysisRequest struct {
	AnalysisID   int64         `json:"analysis_id"`
	ConnectionID *int64        `json:"connection_id,omitempty"`
	EventSetID   *int64        `json:"event_set_id,omitempty"`
	Query        *string       `json:"query,omitempty"`
	Events       []views.Event `json:"events,omitempty"`
}

/*

TODO: tests
- updating connection should clear event set and steps
- updating event set should clear steps
- updating connection should NOT clear query

*/
func (s ApiService) UpdateAnalysis(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	decoder := json.NewDecoder(r.Body)
	var updateAnalysisRequest UpdateAnalysisRequest
	err := decoder.Decode(&updateAnalysisRequest)
	if err != nil {
		return err
	}

	// Assert the user has access to the connection and that it exists
	if updateAnalysisRequest.ConnectionID != nil {
		_, err = dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, *updateAnalysisRequest.ConnectionID)
		if err != nil {
			return err
		}
	}

	// Assert the user has access to the event set and that it exists
	if updateAnalysisRequest.EventSetID != nil {
		_, err = eventsets.LoadEventSetByID(s.db, auth.Organization.ID, *updateAnalysisRequest.EventSetID)
		if err != nil {
			return err
		}
	}

	analysis, err := analyses.LoadAnalysisByID(s.db, auth.Organization.ID, updateAnalysisRequest.AnalysisID)
	if err != nil {
		return err
	}

	updatedAnalysis, err := analyses.UpdateAnalysis(
		s.db,
		auth.User.ID,
		auth.Organization.ID,
		*analysis,
		updateAnalysisRequest.ConnectionID,
		updateAnalysisRequest.EventSetID,
		updateAnalysisRequest.Query,
	)
	if err != nil {
		return err
	}

	var events []models.Event
	var eventFilters []models.EventFilter
	if updateAnalysisRequest.Events != nil {
		err = s.db.Transaction(func(tx *gorm.DB) error {
			// Always deactivate the steps on a funnel update, since changing any value invalidates the old steps
			err = analyses.DeactivateEvents(s.db, analysis.ID)
			if err != nil {
				return err
			}

			// Ignore adding funnel steps from request if the connection or event set changed
			sourceChanged := (analysis.ConnectionID != updatedAnalysis.ConnectionID) || (analysis.EventSetID != updatedAnalysis.EventSetID)
			if updateAnalysisRequest.Events != nil && !sourceChanged {
				events, eventFilters, err = analyses.CreateEventsAndFilters(s.db, analysis.ID, updateAnalysisRequest.Events)
				if err != nil {
					return err
				}
			}

			return nil
		})
	}

	if err != nil {
		return err
	}

	var updatedConnection *models.DataConnection
	if updatedAnalysis.ConnectionID.Valid {
		updatedConnection, err = dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, updatedAnalysis.ConnectionID.Int64)
		if err != nil {
			return nil
		}
	}

	var updatedEventSet *models.EventSet
	if updatedAnalysis.EventSetID.Valid {
		updatedEventSet, err = eventsets.LoadEventSetByID(s.db, auth.Organization.ID, updatedAnalysis.EventSetID.Int64)
		if err != nil {
			return nil
		}
	}

	analysisView := views.Analysis{
		Analysis:   *updatedAnalysis,
		Events:     views.ConvertEvents(events, eventFilters),
		Connection: updatedConnection,
		EventSet:   updatedEventSet,
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(analysisView)
}
