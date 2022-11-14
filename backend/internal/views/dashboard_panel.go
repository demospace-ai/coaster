package views

import "fabra/internal/models"

type DashboardPanel struct {
	Title      string           `json:"title"`
	PanelType  models.PanelType `json:"panel_type"`
	AnalysisID *int64           `json:"analysis_id"`
	Content    *string          `json:"content"`
}

func ConvertDashboardPanels(panels []models.DashboardPanel) []DashboardPanel {
	panelViews := []DashboardPanel{}
	for _, panel := range panels {
		view := DashboardPanel{
			Title:     panel.Title,
			PanelType: panel.PanelType,
		}
		if panel.AnalysisID.Valid {
			view.AnalysisID = &panel.AnalysisID.Int64
		}

		panelViews = append(panelViews, view)
	}

	return panelViews
}
