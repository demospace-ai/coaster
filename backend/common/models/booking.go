package models

import "time"

type Booking struct {
	ListingID  int64     `json:"listing_id"`
	TimeSlotID int64     `json:"time_slot_id"` // Can determine start time from time slot
	StartDate  time.Time `json:"start_date"`   // Must have date because time slots can be used for more than one days
	Guests     int       `json:"guests"`

	BaseModel
}
