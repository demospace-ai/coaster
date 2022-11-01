package views

import "fabra/internal/models"

type Event struct {
	Name    string        `json:"name"`
	Filters []EventFilter `json:"filters"`
}

type Property struct {
	Name string              `json:"name"`
	Type models.PropertyType `json:"type"`
}

type EventFilter struct {
	Property              Property          `json:"property,omitempty"`
	FilterType            models.FilterType `json:"filter_type,omitempty"`
	PropertyValue         string            `json:"property_value"` // Don't omit empty because it is valid for this to be missing
	CustomPropertyGroupID *int64            `json:"custom_property_group_id,omitempty"`
}

func ConvertEvents(events []models.Event, eventFilters []models.EventFilter) []Event {
	filterMap := map[int64][]EventFilter{} // Step ID to slice of views.StepFilter
	for _, eventFilter := range eventFilters {
		eventFilterView := EventFilter{
			Property: Property{
				Name: eventFilter.PropertyName,
				Type: eventFilter.PropertyType,
			},
			FilterType:    eventFilter.FilterType,
			PropertyValue: eventFilter.PropertyValue,
		}
		filterMap[eventFilter.EventID] = append(filterMap[eventFilter.EventID], eventFilterView)
	}

	eventsView := []Event{}
	for _, event := range events {
		eventFilters, ok := filterMap[event.ID]
		if !ok {
			// Default value should be an empty list
			eventFilters = []EventFilter{}
		}

		view := Event{
			Name:    event.Name,
			Filters: eventFilters,
		}
		eventsView = append(eventsView, view)
	}

	return eventsView
}
