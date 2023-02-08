package models

import "fabra/internal/database"

type Source struct {
	OrganizationID int64               `json:"organization_id"`
	DisplayName    string              `json:"display_name"`
	ConnectionID   int64               `json:"connection_id"`
	Namespace      database.NullString `json:"namespace"`
	TableName      database.NullString `json:"table_name"`
	CustomJoin     database.NullString `json:"custom_join"`

	BaseModel
}
