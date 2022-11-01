package api

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"net/http"
	"time"
)

type CreateAnalysisRequest struct {
	AnalysisType models.AnalysisType `json:"analysis_type"`
	ConnectionID *int64              `json:"connection_id,omitempty"`
	EventSetID   *int64              `json:"event_set_id,omitempty"`
	Query        *string             `json:"query,omitempty"`
	Events       []views.Event       `json:"events,omitempty"`
	Timezone     string              `json:"timezone"`
}

type CreateAnalysisResponse struct {
	Analysis   views.Analysis         `json:"analysis"`
	Connection *models.DataConnection `json:"connection"`
	EventSet   *models.EventSet       `json:"event_set"`
}

func (s ApiService) CreateAnalysis(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	decoder := json.NewDecoder(r.Body)
	var createAnalysisRequest CreateAnalysisRequest
	err := decoder.Decode(&createAnalysisRequest)
	if err != nil {
		return err
	}

	switch createAnalysisRequest.AnalysisType {
	case models.AnalysisTypeCustomQuery:
	case models.AnalysisTypeFunnel:
		break
	default:
		return errors.NewBadRequest("must provide valid analysis type")
	}

	// Assert the user has access to the connection
	var connection *models.DataConnection
	if createAnalysisRequest.ConnectionID != nil {
		connection, err = dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, *createAnalysisRequest.ConnectionID)
		if err != nil {
			return nil
		}
	}

	// Assert the user has access to the event set
	var eventSet *models.EventSet
	if createAnalysisRequest.EventSetID != nil {
		eventSet, err = eventsets.LoadEventSetByID(s.db, auth.Organization.ID, *createAnalysisRequest.EventSetID)
		if err != nil {
			return nil
		}
	}

	currentTime := time.Now().UTC()
	loc, err := time.LoadLocation(createAnalysisRequest.Timezone)
	if err == nil {
		currentTime = currentTime.In(loc)
	}

	title := createAnalysisRequest.AnalysisType.ToString() + " - " + currentTime.Format("Jan 2 15:04")
	analysis, err := analyses.CreateAnalysis(
		s.db,
		auth.User.ID,
		auth.Organization.ID,
		createAnalysisRequest.AnalysisType,
		createAnalysisRequest.ConnectionID,
		createAnalysisRequest.EventSetID,
		createAnalysisRequest.Query,
		title,
	)
	if err != nil {
		return err
	}

	var events []models.Event
	var eventFilters []models.EventFilter
	if createAnalysisRequest.Events != nil {
		events, eventFilters, err = analyses.CreateEventsAndFilters(s.db, analysis.ID, createAnalysisRequest.Events)
		if err != nil {
			return err
		}
	}

	analysisView := views.Analysis{
		Analysis: *analysis,
		Events:   views.ConvertEvents(events, eventFilters),
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(CreateAnalysisResponse{
		Analysis:   analysisView,
		Connection: connection,
		EventSet:   eventSet,
	})
}
