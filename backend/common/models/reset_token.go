package models

import "time"

type ResetToken struct {
	UserID     int64
	Token      string
	Expiration time.Time

	BaseModel
}
