package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dashboards"
	"fabra/internal/views"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (s ApiService) GetDashboard(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	vars := mux.Vars(r)
	strDashboardID, ok := vars["dashboardID"]
	if !ok {
		return fmt.Errorf("missing analysis ID from GetQuetion request URL: %s", r.URL.RequestURI())
	}

	dashboardID, err := strconv.ParseInt(strDashboardID, 10, 64)
	if err != nil {
		return nil
	}

	dashboard, err := dashboards.LoadDashboardByID(s.db, auth.Organization.ID, dashboardID)
	if err != nil {
		return err
	}

	panels, err := dashboards.LoadPanelsByDashboardID(s.db, dashboard.ID)
	if err != nil {
		return err
	}

	dashboardView := views.Dashboard{
		Dashboard: *dashboard,
		Panels:    views.ConvertDashboardPanels(panels),
	}

	return json.NewEncoder(w).Encode(dashboardView)
}
