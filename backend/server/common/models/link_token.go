package models

import "time"

type LinkToken struct {
	OrganizationID int64  `json:"organization_id"`
	EndCustomerID  string `json:"end_customer_id"`
	HashedToken    string `json:"hashed_token"`
	Expiration     time.Time

	BaseModel
}
