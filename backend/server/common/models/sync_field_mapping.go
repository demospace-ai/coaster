package models

type SyncFieldMapping struct {
	SyncID             int64
	SourceFieldName    string `json:"source_field_name"`
	DestinationFieldId int64  `json:"destination_field_id"`

	BaseModel
}
