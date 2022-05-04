package models

import (
	"database/sql"
	"time"
)

type BaseModel struct {
	// TODO: don't expose internal database ID to public
	ID            int64 `json:"id"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeactivatedAt sql.NullTime
}
