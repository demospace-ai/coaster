package input

import "go.fabra.io/server/common/data"

type FieldMapping struct {
	SourceFieldName    string          `json:"source_field_name"`
	SourceFieldType    data.ColumnType `json:"source_field_type"`
	DestinationFieldId int64           `json:"destination_field_id"`
}
