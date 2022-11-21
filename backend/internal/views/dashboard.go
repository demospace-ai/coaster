package views

import "fabra/internal/models"

type Dashboard struct {
	models.Dashboard
	Panels []DashboardPanel `json:"panels"`
}
