package input

type SyncFieldMapping struct {
	SourceFieldName    string `json:"source_field_name"`
	DestinationFieldId int64  `json:"destination_field_id"`
}
