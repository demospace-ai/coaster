package models

type FilterType string

const (
	FilterTypeEqual       FilterType = "equal"
	FilterTypeNotEqual    FilterType = "not_equal"
	FilterTypeGreaterThan FilterType = "greater_than"
	FilterTypeLessThan    FilterType = "less_than"
	FilterTypeContains    FilterType = "contains"
	FilterTypeNotContains FilterType = "not_contains"
)

type PropertyType string

const (
	PropertyTypeString    PropertyType = "STRING"
	PropertyTypeInteger   PropertyType = "INTEGER"
	PropertyTypeTimestamp PropertyType = "TIMESTAMP"
)

// TODO: marshal to externally-friendly json
type EventFilter struct {
	AnalysisID    int64        `json:"analysis_id"`
	EventID       int64        `json:"event_id"`
	PropertyName  string       `json:"property_name"`
	PropertyType  PropertyType `json:"property_type"`
	FilterType    FilterType   `json:"filter_type"`
	PropertyValue string       `json:"property_value"`

	BaseModel
}
