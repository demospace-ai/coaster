package models

type ApiKey struct {
	OrganizationID int64
	ApiKey         string
	HashedKey      string

	BaseModel
}
