package models

type Object struct {
	OrganizationID     int64  `json:"organization_id"`
	DisplayName        string `json:"display_name"`
	DestinationID      int64  `json:"destination_id"`
	Namespace          string `json:"namespace"`
	TableName          string `json:"table_name"`
	EndCustomerIdField string `json:"end_customer_id_field"`

	BaseModel
}
