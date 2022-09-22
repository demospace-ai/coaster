package views

import "fabra/internal/models"

type Analysis struct {
	models.Analysis
	FunnelSteps []models.FunnelStep `json:"funnel_steps"`
}
