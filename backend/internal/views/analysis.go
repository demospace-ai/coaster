package views

import "fabra/internal/models"

type Analysis struct {
	models.Analysis
	Events     []Event                `json:"events"`
	Connection *models.DataConnection `json:"connection,omitempty"`
	EventSet   *models.EventSet       `json:"event_set,omitempty"`
}
