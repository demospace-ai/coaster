package models

import "fabra/internal/database"

type PanelType string

const (
	PanelTypeInsight PanelType = "insight"
	PanelTypeText    PanelType = "text"
)

// TODO: marshal to externally-friendly json
type Dashboard struct {
	UserID         int64               `json:"user_id"`
	OrganizationID int64               `json:"organization_id"`
	Title          string              `json:"title"`
	Description    database.NullString `json:"description"`

	BaseModel
}

type DashboardPanel struct {
	DashboardID int64
	Title       string
	PanelType   PanelType
	AnalysisID  database.NullInt64
	Content     database.NullString

	BaseModel
}
