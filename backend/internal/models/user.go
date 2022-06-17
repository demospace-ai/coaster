package models

import "fabra/internal/database"

type User struct {
	FirstName         string `json:"first_name"`
	LastName          string `json:"last_name"`
	Email             string `json:"email"`
	ProfilePictureURL string
	OrganizationID    database.NullInt64

	BaseModel
}
