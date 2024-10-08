package input

import (
	"time"

	"go.coaster.io/server/common/database"
	"go.coaster.io/server/common/models"
)

type TimeSlot struct {
	StartTime *database.Time `json:"start_time"`
	DayOfWeek *time.Weekday  `json:"day_of_week"`
	Capacity  *int64         `json:"capacity"`
}

type AvailabilityRule struct {
	Name            string                      `json:"name" validate:"required"`
	Type            models.AvailabilityRuleType `json:"type" validate:"required"`
	StartDate       *database.Date              `json:"start_date"`
	EndDate         *database.Date              `json:"end_date"`
	RecurringYears  []int32                     `json:"recurring_years"`
	RecurringMonths []int32                     `json:"recurring_months"`

	TimeSlots []TimeSlot `json:"time_slots" validate:"required"`
}

type AvailabilityRuleUpdates struct {
	// We do not allow updating the availability rule type
	Name            *string        `json:"name,omitempty"`
	StartDate       *database.Date `json:"start_date,omitempty"`
	EndDate         *database.Date `json:"end_date,omitempty"`
	RecurringYears  []int32        `json:"recurring_years,omitempty"`
	RecurringMonths []int32        `json:"recurring_months,omitempty"`

	TimeSlots []TimeSlot `json:"time_slots"`
}
