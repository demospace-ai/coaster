package views

import "fabra/internal/models"

type FunnelStep struct {
	Name    string   `json:"step_name"`
	Filters []Filter `json:"filters"`
}

type FilterType string

const (
	FilterTypeEqual       FilterType = "equal"
	FilterTypeNotEqual    FilterType = "not_equal"
	FilterTypeGreaterThan FilterType = "greater_than"
	FilterTypeLessThan    FilterType = "less_than"
	FilterTypeContains    FilterType = "contains"
	FilterTypeNotContains FilterType = "not_contains"
)

type Filter struct {
	FilterPropertyName    string     `json:"filter_property_name"`
	FilterType            FilterType `json:"filter_type"`
	FilterValue           string     `json:"filter_value"`
	CustomPropertyGroupID *int64     `json:"custom_property_group_id,omitempty"`
}

func ConvertFunnelSteps(funnelSteps []models.FunnelStep) []FunnelStep {
	funnelStepsView := []FunnelStep{}
	for _, funnelStep := range funnelSteps {
		view := FunnelStep{
			Name:    funnelStep.StepName,
			Filters: []Filter{}, // TODO
		}
		funnelStepsView = append(funnelStepsView, view)
	}

	return funnelStepsView
}
