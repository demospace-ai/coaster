package auth

import (
	"go.fabra.io/server/common/models"
)

type Authentication struct {
	Session         *models.Session
	User            *models.User
	Organization    *models.Organization
	IsAuthenticated bool
}
