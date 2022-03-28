package handlers

import (
	"gorm.io/gorm"
)

type Env struct {
	Db   *gorm.DB
}
