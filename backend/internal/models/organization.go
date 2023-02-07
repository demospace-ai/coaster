package models

type Organization struct {
	Name        string `json:"name"`
	EmailDomain string `json:"email_domain"`

	BaseModel
}
