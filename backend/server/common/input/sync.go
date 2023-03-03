package input

type FieldMapping struct {
	SourceFieldName    string `json:"source_field_name"`
	DestinationFieldId int64  `json:"destination_field_id"`
}
