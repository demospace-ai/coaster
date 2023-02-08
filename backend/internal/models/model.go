package models

import "fabra/internal/database"

type Model struct {
	OrganizationID   int64               `json:"organization_id"`
	DisplayName      string              `json:"display_name"`
	DestinationID    int64               `json:"destination_id"`
	Namespace        database.NullString `json:"namespace"`
	TableName        database.NullString `json:"table_name"`
	CustomJoin       database.NullString `json:"custom_join"`
	CustomerIdColumn string              `json:"customer_id_column"`

	BaseModel
}
