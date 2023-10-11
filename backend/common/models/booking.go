package models

import (
	"time"

	"go.fabra.io/server/common/database"
)

type Booking struct {
	ListingID int64          `json:"listing_id"`
	UserID    int64          `json:"user_id"`
	StartTime *database.Time `json:"start_time"` // Can be null for date-only listings
	StartDate database.Date  `json:"start_date"` // Must have date because time slots can be used for more than one days
	Guests    int64          `json:"guests"`
	ExpiresAt time.Time      `json:"expires_at"` // If the booking is not completed by this time, it is ignored

	BaseModel
}
