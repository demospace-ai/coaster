package views

import "fabra/internal/models"

type Analysis struct {
	models.Analysis
	Events []Event `json:"events"`
}
