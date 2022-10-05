package views

import "fabra/internal/models"

type FunnelStep struct {
	Name    string       `json:"step_name"`
	Filters []StepFilter `json:"filters"`
}

type Property struct {
	Name string              `json:"name"`
	Type models.PropertyType `json:"type"`
}

type StepFilter struct {
	Property              Property          `json:"property,omitempty"`
	FilterType            models.FilterType `json:"filter_type,omitempty"`
	PropertyValue         string            `json:"property_value"` // Don't omit empty because it is valid for this to be missing
	CustomPropertyGroupID *int64            `json:"custom_property_group_id,omitempty"`
}

func ConvertFunnelSteps(funnelSteps []models.FunnelStep, stepFilters []models.StepFilter) []FunnelStep {
	filterMap := map[int64][]StepFilter{} // Step ID to slice of views.StepFilter
	for _, stepFilter := range stepFilters {
		stepFilterView := StepFilter{
			Property: Property{
				Name: stepFilter.PropertyName,
				Type: stepFilter.PropertyType,
			},
			FilterType:    stepFilter.FilterType,
			PropertyValue: stepFilter.PropertyValue,
		}
		filterMap[stepFilter.StepID] = append(filterMap[stepFilter.StepID], stepFilterView)
	}

	funnelStepsView := []FunnelStep{}
	for _, funnelStep := range funnelSteps {
		stepFilters, ok := filterMap[funnelStep.ID]
		if !ok {
			// Default value should be an empty list
			stepFilters = []StepFilter{}
		}

		view := FunnelStep{
			Name:    funnelStep.StepName,
			Filters: stepFilters,
		}
		funnelStepsView = append(funnelStepsView, view)
	}

	return funnelStepsView
}
