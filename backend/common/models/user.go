package models

type User struct {
	FirstName         string  `json:"first_name"`
	LastName          string  `json:"last_name"`
	Email             string  `json:"email"`
	Phone             *string `json:"phone"`
	About             string  `json:"about"`
	ProfilePictureURL string  `json:"profile_picture_url"`
	Blocked           bool    `json:"-"`
	IsHost            bool    `json:"is_host"`

	BaseModel
}
