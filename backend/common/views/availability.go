package views

import (
	"time"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/availability_rules"
)

type AvailabilityRule struct {
	ID              int64                       `json:"id"`
	ListingID       int64                       `json:"listing_id"`
	Name            string                      `json:"name"`
	Type            models.AvailabilityRuleType `json:"type"`
	StartDate       *database.Date              `json:"start_date"`
	EndDate         *database.Date              `json:"end_date"`
	RecurringYears  []int32                     `json:"recurring_years"`
	RecurringMonths []int32                     `json:"recurring_months"`
	TimeSlots       []TimeSlot                  `json:"time_slots"`
}

type TimeSlot struct {
	ID                 int64          `json:"id"`
	AvailabilityRuleID int64          `json:"availability_rule_id"`
	DayOfWeek          *time.Weekday  `json:"day_of_week"`
	StartTime          *database.Time `json:"start_time"`
	Capacity           int            `json:"capacity"`
}

func ConvertAvailabilityRules(availabilityRules []availability_rules.RuleAndTimes) []AvailabilityRule {
	converted := make([]AvailabilityRule, len(availabilityRules))
	for i, availabilityRule := range availabilityRules {
		converted[i] = AvailabilityRule{
			ID:              availabilityRule.ID,
			Name:            availabilityRule.Name,
			ListingID:       availabilityRule.ListingID,
			Type:            availabilityRule.Type,
			StartDate:       availabilityRule.StartDate,
			EndDate:         availabilityRule.EndDate,
			RecurringYears:  availabilityRule.RecurringYears,
			RecurringMonths: availabilityRule.RecurringMonths,
			TimeSlots:       ConvertTimeSlots(availabilityRule.TimeSlots),
		}
	}

	return converted
}

func ConvertTimeSlots(timeSlots []models.TimeSlot) []TimeSlot {
	converted := make([]TimeSlot, len(timeSlots))
	for i, timeSlot := range timeSlots {
		converted[i] = TimeSlot{
			ID:                 timeSlot.ID,
			AvailabilityRuleID: timeSlot.AvailabilityRuleID,
			DayOfWeek:          timeSlot.DayOfWeek,
			StartTime:          timeSlot.StartTime,
			Capacity:           timeSlot.Capacity,
		}
	}

	return converted
}
