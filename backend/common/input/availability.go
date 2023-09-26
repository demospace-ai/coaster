package input

import (
	"time"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"
)

type TimeSlot struct {
	DayOfWeek *time.Weekday  `json:"day_of_week"`
	StartTime *database.Time `json:"start_time"`
	Capacity  int            `json:"capacity" validate:"required"`
}

type AvailabilityRule struct {
	ListingID       int64                       `json:"listing_id" validate:"required"`
	Type            models.AvailabilityRuleType `json:"type" validate:"required"`
	StartDate       *database.Date              `json:"start_date"`
	EndDate         *database.Date              `json:"end_date"`
	RecurringYears  []int32                     `json:"recurring_years"`
	RecurringMonths []int32                     `json:"recurring_months"`

	TimeSlots []TimeSlot `json:"time_slots" validate:"required"`
}
