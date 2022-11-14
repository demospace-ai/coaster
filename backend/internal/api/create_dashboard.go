package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dashboards"
	"fabra/internal/views"
	"net/http"
	"time"
)

type CreateDashboardRequest struct {
	Timezone string `json:"timezone"`
}

func (s ApiService) CreateDashboard(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var createDashboardRequest CreateDashboardRequest
	err := decoder.Decode(&createDashboardRequest)
	if err != nil {
		return err
	}

	currentTime := time.Now().UTC()
	loc, err := time.LoadLocation(createDashboardRequest.Timezone)
	if err == nil {
		currentTime = currentTime.In(loc)
	}

	title := "Dashboard - " + currentTime.Format("Jan 2 15:04")
	dashboard, err := dashboards.CreateDashboard(
		s.db,
		auth.User.ID,
		auth.Organization.ID,
		title,
	)
	if err != nil {
		return err
	}

	analysisView := views.Dashboard{
		Dashboard: *dashboard,
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(analysisView)
}
