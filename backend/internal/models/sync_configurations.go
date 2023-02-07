package models

import "fabra/internal/database"

type SyncConfiguration struct {
	OrganizationID int64
	DisplayName    string              `json:"display_name"`
	ConnectionID   int64               `json:"connection_id"`
	DatasetName    database.NullString `json:"dataset_name"`
	TableName      database.NullString `json:"table_name"`
	CustomJoin     database.NullString `json:"custom_join"`

	BaseModel
}
