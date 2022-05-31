package auth

import "fabra/internal/models"

type Authentication struct {
	Session         *models.Session
	User            *models.User
	IsAuthenticated bool
}
