package models

type User struct {
	FirstName         string      `json:"first_name"`
	LastName          string      `json:"last_name"`
	Email             string      `json:"email"`
	Phone             *string     `json:"phone"`
	About             string      `json:"about"`
	ProfilePictureURL string      `json:"profile_picture_url"`
	Blocked           bool        `json:"-"`
	HashedPassword    *string     `json:"-"`
	LoginMethod       LoginMethod `json:"login_method"`
	IsHost            bool        `json:"is_host"`
	EmailVerified     bool        `json:"email_verified"`

	BaseModel
}

type LoginMethod string

const (
	LoginMethodEmail     LoginMethod = "email"
	LoginMethodGoogle    LoginMethod = "google"
	LoginMethodUndefined LoginMethod = "undefined"
)

type Waitlist struct {
	Phone string `json:"phone"`

	BaseModel
}

func (Waitlist) TableName() string {
	return "waitlist"
}
