package models

import (
	"time"

	"github.com/lib/pq"
	"go.fabra.io/server/common/database"
)

type AvailabilityRuleType string

const (
	AvailabilityRuleTypeFixedDate  AvailabilityRuleType = "fixed_date"
	AvailabilityRuleTypeFixedRange AvailabilityRuleType = "fixed_range"
	AvailabilityRuleTypeRecurring  AvailabilityRuleType = "recurring"
)

type AvailabilityRule struct {
	ListingID       int64                `json:"listing_id"`
	Name            string               `json:"name"`
	Type            AvailabilityRuleType `json:"type"`
	StartDate       *database.Date       `json:"start_date"`                              // Can be nil for recurring rules
	EndDate         *database.Date       `json:"end_date"`                                // Can be nil for recurring rules
	RecurringYears  pq.Int32Array        `json:"recurring_years"  gorm:"type:SMALLINT[]"` // Can be nil for fixed rules
	RecurringMonths pq.Int32Array        `json:"recurring_months" gorm:"type:SMALLINT[]"` // Can be nil for fixed rules

	BaseModel
}

type TimeSlot struct {
	AvailabilityRuleID int64         `json:"availability_rule_id"`
	StartTime          database.Time `json:"start_time"`  // Always present because all day listings do not have time slots
	Capacity           *int64        `json:"capacity"`    // Will use the listing's capacity if nil
	DayOfWeek          *time.Weekday `json:"day_of_week"` // Can be nil for fixed date rules

	BaseModel
}
