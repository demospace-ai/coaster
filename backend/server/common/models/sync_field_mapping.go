package models

type SyncFieldMapping struct {
	SyncID               int64
	SourceFieldName      string `json:"source_field_name"`
	DestinationFieldName string `json:"destination_field_name"`

	BaseModel
}
