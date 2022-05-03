package auth

import "fabra/internal/models"

type Authentication struct {
	Session         *models.Session
	IsAuthenticated bool
}
