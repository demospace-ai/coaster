package views

import "go.fabra.io/server/common/models"

type User struct {
	ID                int64  `json:"id"`
	FirstName         string `json:"first_name"`
	LastName          string `json:"last_name"`
	Email             string `json:"email"`
	About             string `json:"about"`
	ProfilePictureURL string `json:"profile_picture_url"`
}

func ConvertUser(user models.User) User {
	return User{
		ID:                user.ID,
		FirstName:         user.FirstName,
		LastName:          user.LastName,
		Email:             user.Email,
		About:             user.About,
		ProfilePictureURL: user.ProfilePictureURL,
	}
}
