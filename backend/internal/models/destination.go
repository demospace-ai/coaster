package models

type Destination struct {
	OrganizationID int64  `json:"organization_id"`
	DisplayName    string `json:"display_name"`
	ConnectionID   int64  `json:"connection_id"`

	BaseModel
}

type DestinationConnection struct {
	OrganizationID int64
	DisplayName    string
	ConnectionID   int64
	ConnectionType ConnectionType
}
