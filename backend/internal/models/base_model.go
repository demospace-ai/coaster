package models

import (
	"database/sql"
	"time"
)

type BaseModel struct {
	ID            int64
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeactivatedAt sql.NullTime
}
