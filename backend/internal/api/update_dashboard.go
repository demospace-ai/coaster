package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dashboards"
	"fabra/internal/models"
	"fabra/internal/views"
	"net/http"

	"gorm.io/gorm"
)

type UpdateDashboardRequest struct {
	DashboardID int64                  `json:"dashboard_id"`
	Title       *string                `json:"title,omitempty"`
	Description *string                `json:"description,omitempty"`
	Panels      []views.DashboardPanel `json:"panels,omitempty"`
}

func (s ApiService) UpdateDashboard(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var updateDashboardRequest UpdateDashboardRequest
	err := decoder.Decode(&updateDashboardRequest)
	if err != nil {
		return err
	}

	dashboard, err := dashboards.LoadDashboardByID(s.db, auth.Organization.ID, updateDashboardRequest.DashboardID)
	if err != nil {
		return err
	}

	updatedDashboard, err := dashboards.UpdateDashboard(
		s.db,
		auth.User.ID,
		auth.Organization.ID,
		*dashboard,
		updateDashboardRequest.Title,
		updateDashboardRequest.Description,
	)
	if err != nil {
		return err
	}

	var panels []models.DashboardPanel
	if updateDashboardRequest.Panels != nil {
		err = s.db.Transaction(func(tx *gorm.DB) error {
			err = dashboards.DeactivatePanels(s.db, dashboard.ID)
			if err != nil {
				return err
			}

			panels, err = dashboards.CreatePanels(s.db, dashboard.ID, updateDashboardRequest.Panels)
			if err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			return err
		}
	} else {
		// Simply load the existing events so the response has the full analysis view
		panels, err = dashboards.LoadPanelsByDashboardID(s.db, dashboard.ID)
		if err != nil {
			return err
		}
	}

	dashboardView := views.Dashboard{
		Dashboard: *updatedDashboard,
		Panels:    views.ConvertDashboardPanels(panels),
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(dashboardView)
}
