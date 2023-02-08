package models

type SyncConfiguration struct {
	OrganizationID int64
	EndCustomerID  int64
	DisplayName    string `json:"display_name"`
	DestinationID  int64  `json:"destination_id"`
	SourceID       int64  `json:"source_id"`
	ModelID        int64  `json:"model_id"`

	BaseModel
}
