package api

import (
	"fabra/internal/auth"
	"fabra/internal/dashboards"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type DeleteDashboardRequest struct {
	DashboardID int64 `json:"dashbaord_id"`
}

func (s ApiService) DeleteDashboard(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strDashboardID, ok := vars["dashboardID"]
	if !ok {
		return fmt.Errorf("missing dashboard ID from DeleteDashboard request URL: %s", r.URL.RequestURI())
	}

	dashboardID, err := strconv.ParseInt(strDashboardID, 10, 64)
	if err != nil {
		return nil
	}

	return dashboards.DeactivateDashboardByID(s.db, auth.Organization.ID, dashboardID)
}
