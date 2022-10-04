package views

import "fabra/internal/models"

type Analysis struct {
	models.Analysis
	FunnelSteps []FunnelStep `json:"funnel_steps"`
}
