package handlers

import (
	"encoding/json"
	"fabra/internal/analyses"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type GetAnalysisResponse struct {
	Analysis   views.Analysis         `json:"analysis"`
	Connection *models.DataConnection `json:"connection"`
	EventSet   *models.EventSet       `json:"event_set"`
}

func GetAnalysis(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	vars := mux.Vars(r)
	strAnalysisID, ok := vars["analysisID"]
	if !ok {
		return fmt.Errorf("missing analysis ID from GetQuetion request URL: %s", r.URL.RequestURI())
	}

	analysisID, err := strconv.ParseInt(strAnalysisID, 10, 64)
	if err != nil {
		return nil
	}

	analysis, err := analyses.LoadAnalysisByID(env.Db, env.Auth.Organization.ID, analysisID)
	if err != nil {
		return err
	}

	var funnelSteps []models.FunnelStep
	if analysis.AnalysisType == models.AnalysisTypeFunnel {
		funnelSteps, err = analyses.LoadFunnelStepsByAnalysisID(env.Db, analysis.ID)
		if err != nil {
			return err
		}
	}

	analysisView := views.Analysis{
		Analysis:    *analysis,
		FunnelSteps: funnelSteps,
	}

	var connection *models.DataConnection
	if analysis.ConnectionID.Valid {
		connection, err = dataconnections.LoadDataConnectionByID(env.Db, env.Auth.Organization.ID, analysis.ConnectionID.Int64)
		if err != nil {
			return nil
		}
	}

	// Assert the user has access to the event set
	var eventSet *models.EventSet
	if analysis.EventSetID.Valid {
		eventSet, err = eventsets.LoadEventSetByID(env.Db, env.Auth.Organization.ID, analysis.EventSetID.Int64)
		if err != nil {
			return nil
		}
	}

	return json.NewEncoder(w).Encode(GetAnalysisResponse{
		Analysis:   analysisView,
		Connection: connection,
		EventSet:   eventSet,
	})
}
