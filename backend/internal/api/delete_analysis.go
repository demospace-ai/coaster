package api

import (
	"fabra/internal/analyses"
	"fabra/internal/auth"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type DeleteAnalysisRequest struct {
	AnalysisID int64 `json:"analysis_id"`
}

func (s ApiService) DeleteAnalysis(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strAnalysisID, ok := vars["analysisID"]
	if !ok {
		return fmt.Errorf("missing analysis ID from DeleteAnalysis request URL: %s", r.URL.RequestURI())
	}

	analysisID, err := strconv.ParseInt(strAnalysisID, 10, 64)
	if err != nil {
		return nil
	}

	return analyses.DeactivateAnalyisByID(s.db, auth.Organization.ID, analysisID)
}
