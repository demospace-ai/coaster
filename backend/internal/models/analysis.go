package models

import "fabra/internal/database"

type AnalysisType string

const (
	AnalysisTypeCustomQuery AnalysisType = "custom_query"
	AnalysisTypeFunnel      AnalysisType = "funnel"
)

// TODO: marshal to externally-friendly json
type Analysis struct {
	UserID         int64               `json:"user_id"`
	OrganizationID int64               `json:"organization_id"`
	AnalysisType   AnalysisType        `json:"analysis_type"`
	ConnectionID   database.NullInt64  `json:"connection_id"`
	EventSetID     database.NullInt64  `json:"event_set_id"`
	Title          database.NullString `json:"title,omitempty"`
	Query          database.NullString `json:"query"`

	BaseModel
}
