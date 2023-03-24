package models

type EndCustomerApiKey struct {
	OrganizationID int64
	EndCustomerID  int64
	EncryptedKey   string

	BaseModel
}
