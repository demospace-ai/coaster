package models

type EventSet struct {
	OrganizationID       int64
	DisplayName          string `json:"display_name"`
	ConnectionID         int64  `json:"connection_id"`
	DatasetName          string `json:"dataset_name"`
	TableName            string `json:"table_name"`
	EventTypeColumn      string `json:"event_type_column"`
	TimestampColumn      string `json:"timestamp_column"`
	UserIdentifierColumn string `json:"user_identifier_column"`

	BaseModel
}
