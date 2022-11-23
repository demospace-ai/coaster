package models

import "fabra/internal/database"

type AnalysisType string

const (
	AnalysisTypeCustomQuery AnalysisType = "custom_query"
	AnalysisTypeFunnel      AnalysisType = "funnel"
	AnalysisTypeTrend       AnalysisType = "trend"
)

func (e AnalysisType) ToString() string {
	switch e {
	case AnalysisTypeCustomQuery:
		return "Custom Query"
	case AnalysisTypeFunnel:
		return "Funnel"
	case AnalysisTypeTrend:
		return "Trend"
	default:
		return ""
	}
}

// TODO: marshal to externally-friendly json
type Analysis struct {
	UserID                int64               `json:"user_id"`
	OrganizationID        int64               `json:"organization_id"`
	AnalysisType          AnalysisType        `json:"analysis_type"`
	ConnectionID          database.NullInt64  `json:"connection_id"`
	EventSetID            database.NullInt64  `json:"event_set_id"`
	Query                 database.NullString `json:"query"`
	Title                 string              `json:"title"`
	Description           database.NullString `json:"description"`
	BreakdownPropertyName database.NullString `json:"breakdown_property_name"`
	BreakdownPropertyType PropertyType        `json:"breakdown_property_type"`

	BaseModel
}
