package models

type User struct {
	FirstName           string              `json:"first_name"`
	LastName            string              `json:"last_name"`
	Email               string              `json:"email"`
	Phone               *string             `json:"phone"`
	About               *string             `json:"about"`
	ProfilePictureURL   *string             `json:"profile_picture_url"`
	Blocked             bool                `json:"-"`
	HashedPassword      *string             `json:"-"`
	LoginMethod         LoginMethod         `json:"login_method"`
	IsHost              bool                `json:"is_host"`
	EmailVerified       bool                `json:"email_verified"`
	IsAdmin             bool                `json:"is_admin"`
	StripeAccountID     *string             `json:"stripe_account_id"`
	StripeAccountStatus StripeAccountStatus `json:"stripe_account_status"`
	Currency            string              `json:"currency"`
	CommissionPercent   int64               `json:"commission_percent"`

	BaseModel
}

type StripeAccountStatus string

const (
	StripeAccountStatusIncomplete StripeAccountStatus = "incomplete"
	StripeAccountStatusComplete   StripeAccountStatus = "complete"
)

type LoginMethod string

const (
	LoginMethodEmail     LoginMethod = "email"
	LoginMethodGoogle    LoginMethod = "google"
	LoginMethodUndefined LoginMethod = "undefined"
)

type Waitlist struct {
	Email string `json:"email"`
	Phone string `json:"phone"`

	BaseModel
}

func (Waitlist) TableName() string {
	return "waitlist"
}
