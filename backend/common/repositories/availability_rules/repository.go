package availability_rules

import (
	"time"

	"go.coaster.io/server/common/availability"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/input"
	"go.coaster.io/server/common/models"
	"gorm.io/gorm"
)

func CreateAvailability(db *gorm.DB, listingID int64, availabilityInput input.AvailabilityRule) (*models.AvailabilityRule, error) {
	availabilityRule := models.AvailabilityRule{
		ListingID:       listingID,
		Name:            availabilityInput.Name,
		Type:            availabilityInput.Type,
		StartDate:       availabilityInput.StartDate,
		EndDate:         availabilityInput.EndDate,
		RecurringYears:  availabilityInput.RecurringYears,
		RecurringMonths: availabilityInput.RecurringMonths,
	}

	// Use an empty list to mean "all" for recurring rules
	if availabilityRule.Type == models.AvailabilityRuleTypeRecurring {
		if availabilityRule.RecurringYears == nil {
			availabilityRule.RecurringYears = []int32{}
		}
		if availabilityRule.RecurringMonths == nil {
			availabilityRule.RecurringMonths = []int32{}
		}
	}

	if len(availabilityInput.TimeSlots) == 0 {
		return nil, errors.NewCustomerVisibleError("You must provide at least one time slot.")
	}

	result := db.Create(&availabilityRule)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(availability_rules.CreateAvailability)")
	}

	// TODO: validate based off listing availability type and rule type

	for _, timeSlotInput := range availabilityInput.TimeSlots {
		timeSlot := models.TimeSlot{
			AvailabilityRuleID: availabilityRule.ID,
			DayOfWeek:          timeSlotInput.DayOfWeek,
			StartTime:          timeSlotInput.StartTime,
			Capacity:           timeSlotInput.Capacity,
		}

		result := db.Create(&timeSlot)
		if result.Error != nil {
			return nil, errors.Wrapf(result.Error, "(availability_rules.CreateAvailability) creating time slot: %+v", timeSlot)
		}
	}

	return &availabilityRule, nil
}

func UpdateAvailability(db *gorm.DB, availabilityRule *models.AvailabilityRule, availabilityRuleUpdates input.AvailabilityRuleUpdates) (*availability.RuleAndTimes, error) {
	// We do not allow updating the availability rule type
	if availabilityRuleUpdates.Name != nil {
		availabilityRule.Name = *availabilityRuleUpdates.Name
	}
	if availabilityRuleUpdates.StartDate != nil {
		availabilityRule.StartDate = availabilityRuleUpdates.StartDate
	}
	if availabilityRuleUpdates.EndDate != nil {
		availabilityRule.EndDate = availabilityRuleUpdates.EndDate
	}
	if availabilityRuleUpdates.RecurringYears != nil {
		availabilityRule.RecurringYears = availabilityRuleUpdates.RecurringYears
	}
	if availabilityRuleUpdates.RecurringMonths != nil {
		availabilityRule.RecurringMonths = availabilityRuleUpdates.RecurringMonths
	}

	result := db.Save(&availabilityRule)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(availability_rules.UpdateAvailability)")
	}

	if availabilityRuleUpdates.TimeSlots != nil {
		err := db.Transaction(func(tx *gorm.DB) error {
			result = tx.Table("time_slots").
				Where("time_slots.availability_rule_id = ?", availabilityRule.ID).
				Update("deactivated_at", time.Now())
			if result.Error != nil {
				return errors.Wrap(result.Error, "(availability_rules.UpdateAvailability) deactivating old time slots")
			}

			// TODO: validate based off listing availability type and rule type
			for _, timeSlotInput := range availabilityRuleUpdates.TimeSlots {
				timeSlot := models.TimeSlot{
					AvailabilityRuleID: availabilityRule.ID,
					DayOfWeek:          timeSlotInput.DayOfWeek,
					StartTime:          timeSlotInput.StartTime,
				}

				result := tx.Create(&timeSlot)
				if result.Error != nil {
					return errors.Wrapf(result.Error, "(availability_rules.UpdateAvailability) creating time slot: %+v", timeSlot)
				}
			}

			return nil
		})
		if err != nil {
			return nil, errors.Wrap(err, "(availability_rules.UpdateAvailability) updating time slots")
		}
	}

	timeSlots, err := LoadTimeSlotsForRule(db, availabilityRule.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(availability_rules.UpdateAvailability) loading time slots")
	}

	return &availability.RuleAndTimes{
		AvailabilityRule: *availabilityRule,
		TimeSlots:        timeSlots,
	}, nil
}

func DeactivateAvailability(db *gorm.DB, availabilityRuleID int64) error {
	currentTime := time.Now()
	result := db.Table("availability_rules").
		Where("availability_rules.id = ?", availabilityRuleID).
		Update("deactivated_at", currentTime)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(availability_rules.DeactivateAvailability)")
	}

	result = db.Table("time_slots").
		Where("time_slots.availability_rule_id = ?", availabilityRuleID).
		Update("deactivated_at", currentTime)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(availability_rules.DeactivateAvailability)")
	}

	return nil
}

func DeactivateAllForListing(db *gorm.DB, listingID int64) error {
	currentTime := time.Now()

	return db.Transaction(func(tx *gorm.DB) error {
		var availabilityRuleIDs []int64
		result := tx.Table("availability_rules").
			Select("availability_rules.id").
			Where("availability_rules.listing_id = ?", listingID).
			Where("availability_rules.deactivated_at IS NULL").
			Find(&availabilityRuleIDs)
		if result.Error != nil {
			return errors.Wrapf(result.Error, "(availability_rules.DeactivateAllForListing) error for listingID %d", listingID)
		}

		result = tx.Table("availability_rules").
			Where("availability_rules.id IN ?", availabilityRuleIDs).
			Update("deactivated_at", currentTime)
		if result.Error != nil {
			return errors.Wrap(result.Error, "(availability_rules.DeactivateAllForListing)")
		}

		result = tx.Table("time_slots").
			Where("time_slots.availability_rule_id IN ?", availabilityRuleIDs).
			Update("deactivated_at", currentTime)
		if result.Error != nil {
			return errors.Wrap(result.Error, "(availability_rules.DeactivateAllForListing)")
		}

		return nil
	})
}

func LoadByID(db *gorm.DB, availabilityRuleID int64) (*models.AvailabilityRule, error) {
	var availabilityRule models.AvailabilityRule
	result := db.Table("availability_rules").
		Select("availability_rules.*").
		Where("availability_rules.id = ?", availabilityRuleID).
		Where("availability_rules.deactivated_at IS NULL").
		Take(&availabilityRule)
	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(availability_rules.LoadByID) error for availabilityRuleID %d", availabilityRuleID)
	}

	return &availabilityRule, nil
}

func LoadForListing(db *gorm.DB, listingID int64) ([]availability.RuleAndTimes, error) {
	var availabilityRules []models.AvailabilityRule
	result := db.Table("availability_rules").
		Select("availability_rules.*").
		Where("availability_rules.listing_id = ?", listingID).
		Where("availability_rules.deactivated_at IS NULL").
		Find(&availabilityRules)
	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(availability_rules.LoadForListing) error for listingID %d", listingID)
	}

	availabilityRuleDetails := make([]availability.RuleAndTimes, len(availabilityRules))
	for i, rule := range availabilityRules {
		timeSlots, err := LoadTimeSlotsForRule(db, rule.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(availability_rules.LoadForListing) getting time slots")
		}

		availabilityRuleDetails[i] = availability.RuleAndTimes{
			AvailabilityRule: rule,
			TimeSlots:        timeSlots,
		}
	}

	return availabilityRuleDetails, nil
}

func LoadTimeSlotsForRule(db *gorm.DB, availabilityRuleID int64) ([]models.TimeSlot, error) {
	var timeSlots []models.TimeSlot
	result := db.Table("time_slots").
		Select("time_slots.*").
		Where("time_slots.availability_rule_id = ?", availabilityRuleID).
		Where("time_slots.deactivated_at IS NULL").
		Find(&timeSlots)
	if result.Error != nil {
		// Not guaranteed to have any time slots for a rule so just return an empty slice
		if errors.IsRecordNotFound(result.Error) {
			return []models.TimeSlot{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(availability_rules.LoadTimeSlotsForRule)")
		}
	}

	return timeSlots, nil
}

func LoadAvailabilityInRange(db *gorm.DB, listing models.Listing, startDate time.Time, endDate time.Time) ([]availability.Availability, error) {
	// Loop through each availability rule and compute the availability for this month then merge
	rules, err := LoadForListing(db, listing.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(availability_rules.LoadAvailableDaysInRange)")
	}

	var availability []availability.Availability
	for _, rule := range rules {
		availabilityForRule, err := rule.GetAvailabilityInRange(db, startDate, endDate, listing)
		if err != nil {
			return nil, errors.Wrap(err, "(availability_rules.LoadAvailableDaysInRange)")
		}
		availability = append(availability, availabilityForRule...)
	}

	return availability, nil
}
