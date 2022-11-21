package views

import "fabra/internal/models"

type DashboardPanel struct {
	ID         int64            `json:"id"`
	Title      string           `json:"title"`
	PanelType  models.PanelType `json:"panel_type"`
	AnalysisID *int64           `json:"analysis_id"`
	Content    *string          `json:"content"`
}

func ConvertDashboardPanels(panels []models.DashboardPanel) []DashboardPanel {
	panelViews := []DashboardPanel{}
	for _, panel := range panels {
		view := DashboardPanel{
			ID:        panel.ID,
			Title:     panel.Title,
			PanelType: panel.PanelType,
		}
		if panel.AnalysisID.Valid {
			analysisID := panel.AnalysisID.Int64
			view.AnalysisID = &analysisID
		}

		panelViews = append(panelViews, view)
	}

	return panelViews
}
