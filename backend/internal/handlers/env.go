package handlers

import (
	"fabra/internal/auth"

	"gorm.io/gorm"
)

type Env struct {
	Db   *gorm.DB
	Auth auth.Authentication
}
