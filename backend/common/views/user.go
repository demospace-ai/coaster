package views

import "go.fabra.io/server/common/models"

type User struct {
	ID                  int64                      `json:"id"`
	FirstName           string                     `json:"first_name"`
	LastName            string                     `json:"last_name"`
	Email               string                     `json:"email"`
	Phone               *string                    `json:"phone"`
	About               *string                    `json:"about"`
	ProfilePictureURL   *string                    `json:"profile_picture_url"`
	IsHost              bool                       `json:"is_host"`
	StripeAccountStatus models.StripeAccountStatus `json:"stripe_account_status"`
}

func ConvertUser(user models.User) User {
	return User{
		ID:                  user.ID,
		FirstName:           user.FirstName,
		LastName:            user.LastName,
		Email:               user.Email,
		Phone:               user.Phone,
		About:               user.About,
		ProfilePictureURL:   user.ProfilePictureURL,
		IsHost:              user.IsHost,
		StripeAccountStatus: user.StripeAccountStatus,
	}
}
