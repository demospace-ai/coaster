package views

import "fabra/internal/models"

type Analysis struct {
	models.Analysis
	BreakdownProperty *Property              `json:"breakdown,omitempty"`
	Events            []Event                `json:"events"`
	Connection        *models.DataConnection `json:"connection,omitempty"`
	EventSet          *models.EventSet       `json:"event_set,omitempty"`
}

func ConvertAnalysis(
	analysis *models.Analysis,
	events []models.Event,
	eventFilters []models.EventFilter,
	connection *models.DataConnection,
	eventSet *models.EventSet,
) Analysis {
	var breakdown *Property
	if analysis.BreakdownPropertyName.Valid {
		breakdown = &Property{
			Name: analysis.BreakdownPropertyName.String,
			Type: analysis.BreakdownPropertyType,
		}
	}

	return Analysis{
		Analysis:          *analysis,
		BreakdownProperty: breakdown,
		Events:            ConvertEvents(events, eventFilters),
		Connection:        connection,
		EventSet:          eventSet,
	}
}
