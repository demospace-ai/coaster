package handlers

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"net/http"

	"gorm.io/gorm"
)

type UpdateAnalysisRequest struct {
	AnalysisID   int64    `json:"analysis_id"`
	ConnectionID *int64   `json:"connection_id,omitempty"`
	EventSetID   *int64   `json:"event_set_id,omitempty"`
	Query        *string  `json:"query,omitempty"`
	StepNames    []string `json:"step_names,omitempty"`
}

type UpdateAnalysisResponse struct {
	Analysis   views.Analysis         `json:"analysis"`
	Connection *models.DataConnection `json:"connection"`
	EventSet   *models.EventSet       `json:"event_set"`
}

/*

TODO: tests
- updating connection should clear event set and steps
- updating event set should clear steps
- updating connection should NOT clear query

*/
func UpdateAnalysis(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var updateAnalysisRequest UpdateAnalysisRequest
	err := decoder.Decode(&updateAnalysisRequest)
	if err != nil {
		return err
	}

	// Assert the user has access to the connection and that it exists
	if updateAnalysisRequest.ConnectionID != nil {
		_, err = dataconnections.LoadDataConnectionByID(env.Db, env.Auth.Organization.ID, *updateAnalysisRequest.ConnectionID)
		if err != nil {
			return nil
		}
	}

	// Assert the user has access to the event set and that it exists
	if updateAnalysisRequest.EventSetID != nil {
		_, err = eventsets.LoadEventSetByID(env.Db, env.Auth.Organization.ID, *updateAnalysisRequest.EventSetID)
		if err != nil {
			return nil
		}
	}

	analysis, err := analyses.LoadAnalysisByID(env.Db, env.Auth.Organization.ID, updateAnalysisRequest.AnalysisID)
	if err != nil {
		return err
	}

	updatedAnalysis, err := analyses.UpdateAnalysis(
		env.Db,
		env.Auth.User.ID,
		env.Auth.Organization.ID,
		*analysis,
		updateAnalysisRequest.ConnectionID,
		updateAnalysisRequest.EventSetID,
		updateAnalysisRequest.Query,
	)
	if err != nil {
		return err
	}

	var funnelSteps []models.FunnelStep
	if analysis.AnalysisType == models.AnalysisTypeFunnel {
		err = env.Db.Transaction(func(tx *gorm.DB) error {
			// Always deactivate the steps on a funnel update, since changing any value invalidates the old steps
			err = analyses.DeactivateFunnelSteps(env.Db, analysis.ID)
			if err != nil {
				return err
			}

			// Ignore adding funnel steps from request if the connection or event set changed
			sourceChanged := (analysis.ConnectionID != updatedAnalysis.ConnectionID) || (analysis.EventSetID != updatedAnalysis.EventSetID)
			if updateAnalysisRequest.StepNames != nil && !sourceChanged {
				funnelSteps, err = analyses.CreateFunnelSteps(env.Db, analysis.ID, updateAnalysisRequest.StepNames)
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

	analysisView := views.Analysis{
		Analysis:    *analysis,
		FunnelSteps: funnelSteps,
	}

	var updatedConnection *models.DataConnection
	if analysis.ConnectionID.Valid {
		updatedConnection, err = dataconnections.LoadDataConnectionByID(env.Db, env.Auth.Organization.ID, analysis.ConnectionID.Int64)
		if err != nil {
			return nil
		}
	}

	var updatedEventSet *models.EventSet
	if analysis.EventSetID.Valid {
		updatedEventSet, err = eventsets.LoadEventSetByID(env.Db, env.Auth.Organization.ID, analysis.EventSetID.Int64)
		if err != nil {
			return nil
		}
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(UpdateAnalysisResponse{
		Analysis:   analysisView,
		Connection: updatedConnection,
		EventSet:   updatedEventSet,
	})
}
