package models

type Model struct {
	OrganizationID   int64  `json:"organization_id"`
	DisplayName      string `json:"display_name"`
	DestinationID    int64  `json:"destination_id"`
	Namespace        string `json:"namespace"`
	TableName        string `json:"table_name"`
	CustomerIdColumn string `json:"customer_id_column"`

	BaseModel
}
