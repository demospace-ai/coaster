package models

type ExternalProfile struct {
	ExternalID string
	UserID     int64

	BaseModel
}
