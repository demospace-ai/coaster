package models

import "fabra/internal/database"

type EventSet struct {
	OrganizationID       int64
	DisplayName          string              `json:"display_name"`
	ConnectionID         int64               `json:"connection_id"`
	DatasetName          database.NullString `json:"dataset_name"`
	TableName            database.NullString `json:"table_name"`
	CustomJoin           database.NullString `json:"custom_join"`
	EventTypeColumn      string              `json:"event_type_column"`
	TimestampColumn      string              `json:"timestamp_column"`
	UserIdentifierColumn string              `json:"user_identifier_column"`

	BaseModel
}
