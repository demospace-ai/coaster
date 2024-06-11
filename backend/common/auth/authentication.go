package auth

import (
	"go.coaster.io/server/common/models"
)

type Authentication struct {
	Session         *models.Session
	User            *models.User
	IsAuthenticated bool
}
