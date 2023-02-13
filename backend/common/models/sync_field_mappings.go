package models

type SyncFieldMappings struct {
	SyncConfigurationID  int64
	SourceFieldName      string `json:"source_field_name"`
	DestinationFieldName string `json:"destination_field_name"`

	BaseModel
}
