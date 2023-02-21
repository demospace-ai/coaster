package models

type Source struct {
	OrganizationID int64  `json:"organization_id"`
	DisplayName    string `json:"display_name"`
	EndCustomerID  int64  `json:"end_customer_id"`
	ConnectionID   int64  `json:"connection_id"`

	BaseModel
}

type SourceConnection struct {
	ID             int64
	OrganizationID int64
	EndCustomerID  int64
	DisplayName    string
	ConnectionID   int64
	ConnectionType ConnectionType
}
