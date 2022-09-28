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
)

type CreateAnalysisRequest struct {
	AnalysisType models.AnalysisType `json:"analysis_type"`
	ConnectionID *int64              `json:"connection_id,omitempty"`
	EventSetID   *int64              `json:"event_set_id,omitempty"`
	Query        *string             `json:"query,omitempty"`
	StepNames    []string            `json:"step_names,omitempty"`
}

type CreateAnalysisResponse struct {
	Analysis   views.Analysis         `json:"analysis"`
	Connection *models.DataConnection `json:"connection"`
	EventSet   *models.EventSet       `json:"event_set"`
}

func (s Service) CreateAnalysis(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

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

	analysis, err := analyses.CreateAnalysis(
		s.db,
		auth.User.ID,
		auth.Organization.ID,
		createAnalysisRequest.AnalysisType,
		createAnalysisRequest.ConnectionID,
		createAnalysisRequest.EventSetID,
		createAnalysisRequest.Query,
	)
	if err != nil {
		return err
	}

	var funnelSteps []models.FunnelStep
	if createAnalysisRequest.StepNames != nil {
		funnelSteps, err = analyses.CreateFunnelSteps(s.db, analysis.ID, createAnalysisRequest.StepNames)
		if err != nil {
			return err
		}
	}

	analysisView := views.Analysis{
		Analysis:    *analysis,
		FunnelSteps: funnelSteps,
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(CreateAnalysisResponse{
		Analysis:   analysisView,
		Connection: connection,
		EventSet:   eventSet,
	})
}
