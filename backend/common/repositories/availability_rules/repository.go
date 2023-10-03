package availability_rules

import (
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/timeutils"
	"gorm.io/gorm"
)

type RuleAndTimes struct {
	models.AvailabilityRule
	TimeSlots []models.TimeSlot
}

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

func UpdateAvailability(db *gorm.DB, availabilityRule *models.AvailabilityRule, availabilityRuleUpdates input.AvailabilityRuleUpdates) (*RuleAndTimes, error) {
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

	return &RuleAndTimes{
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

func LoadForListing(db *gorm.DB, listingID int64) ([]RuleAndTimes, error) {
	var availabilityRules []models.AvailabilityRule
	result := db.Table("availability_rules").
		Select("availability_rules.*").
		Where("availability_rules.listing_id = ?", listingID).
		Where("availability_rules.deactivated_at IS NULL").
		Find(&availabilityRules)
	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(availability_rules.LoadForListing) error for listingID %d", listingID)
	}

	availabilityRuleDetails := make([]RuleAndTimes, len(availabilityRules))
	for i, rule := range availabilityRules {
		timeSlots, err := LoadTimeSlotsForRule(db, rule.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(availability_rules.LoadForListing) getting time slots")
		}

		availabilityRuleDetails[i] = RuleAndTimes{
			rule,
			timeSlots,
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

func (rule RuleAndTimes) HasAvailabilityInRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	switch rule.Type {
	case models.AvailabilityRuleTypeFixedDate:
		return rule.HasAvailabilityInRangeFixedDate(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeFixedRange:
		return rule.HasAvailabilityInRangeFixedRange(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeRecurring:
		return rule.HasAvailabilityInRangeRecurring(db, startDate, endDate, listing)
	default:
		// TODO: this should never happen
		return false, errors.Newf("(availability_rules.HasAvailabilityInRange) Unknown availability rule type: %s", rule.Type)
	}
}

// True if the available date is between the start and end date
func (rule RuleAndTimes) HasAvailabilityInRangeFixedDate(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	if timeutils.BetweenOrEqual(time.Time(*rule.StartDate), startDate, endDate) {
		for _, timeSlot := range rule.TimeSlots {
			// All the time slots will be for this single fixed date, so check if any have availability
			hasCapacity, err := rule.HasCapacityForDay(db, time.Time(*rule.StartDate), timeSlot, listing)
			if err != nil {
				return false, errors.Wrap(err, "(availability_rules.HasAvailabilityInRangeRecurring)")
			}

			if hasCapacity {
				return true, nil
			}
		}
	}

	return false, nil
}

// True if any of the available dates are between the start and end date
func (rule RuleAndTimes) HasAvailabilityInRangeFixedRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	// Can have multiple time slots per day of the week
	timeSlotMap := make(map[time.Weekday][]models.TimeSlot)
	for _, timeSlot := range rule.TimeSlots {
		timeSlotMap[*timeSlot.DayOfWeek] = append(timeSlotMap[*timeSlot.DayOfWeek], timeSlot)
	}

	for d := time.Time(*rule.StartDate); !d.After(time.Time(*rule.EndDate)); d = d.AddDate(0, 0, 1) {
		if timeutils.BetweenOrEqual(d, startDate, endDate) {
			for _, timeSlot := range timeSlotMap[d.Weekday()] {
				hasCapacity, err := rule.HasCapacityForDay(db, d, timeSlot, listing)
				if err != nil {
					return false, errors.Wrap(err, "(availability_rules.HasAvailabilityInRangeRecurring)")
				}

				if hasCapacity {
					return true, nil
				}
			}
		}
	}

	return false, nil
}

func (rule RuleAndTimes) HasAvailabilityInRangeRecurring(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	// Generate the list of matching years/months to check since the rule may span infinite years
	matchingYears := getMatchingYears(rule, startDate, endDate)
	matchingMonths := getMatchingMonths(rule, startDate, endDate)

	for _, year := range matchingYears {
		for _, month := range matchingMonths {
			for _, timeSlot := range rule.TimeSlots {
				// Increment by 7 days to get all the days of the week in the month
				for d := timeutils.FirstDayOfWeekInMonth(int(year), month, *timeSlot.DayOfWeek); d.Month() == month; d = d.AddDate(0, 0, 7) {
					if timeutils.BetweenOrEqual(d, startDate, endDate) {
						hasCapacity, err := rule.HasCapacityForDay(db, d, timeSlot, listing)
						if err != nil {
							return false, errors.Wrap(err, "(availability_rules.HasAvailabilityInRangeRecurring)")
						}

						if hasCapacity {
							return true, nil
						}
					}
				}
			}
		}
	}

	return false, nil
}

func (rule RuleAndTimes) HasCapacityForDay(db *gorm.DB, targetDate time.Time, timeSlot models.TimeSlot, listing models.Listing) (bool, error) {
	bookings, err := bookings.LoadBookingsForTimeSlotAndDate(db, targetDate, timeSlot)
	if err != nil {
		return false, errors.Wrap(err, "(availability_rules.HasCapacityForDay) loading bookings")
	}

	if listing.MaxGuests == nil {
		return false, errors.Newf("(availability_rules.HasCapacityForDay) listing %d does not have a max guest count", listing.ID)
	}

	capacity := *listing.MaxGuests
	if timeSlot.Capacity != nil {
		capacity = *timeSlot.Capacity
	}
	remainingCapacity := capacity - int64(len(bookings))
	return remainingCapacity > 0, nil
}

func getMatchingYears(rule RuleAndTimes, startDate time.Time, endDate time.Time) []int {
	var matchingYears []int
	if len(rule.RecurringYears) == 0 {
		// If no years are specified, then the rule applies to all years
		for year := startDate.Year(); year <= endDate.Year(); year++ {
			matchingYears = append(matchingYears, year)
		}
	} else {
		yearsToQuery := make(map[int]bool)
		for year := startDate.Year(); year < endDate.Year(); year++ {
			yearsToQuery[year] = true
		}
		for _, year := range rule.RecurringYears {
			if _, ok := yearsToQuery[int(year)]; ok {
				matchingYears = append(matchingYears, int(year))
			}
		}
	}

	return matchingYears
}

func getMatchingMonths(rule RuleAndTimes, startDate time.Time, endDate time.Time) []time.Month {
	var matchingMonths []time.Month
	monthsToQuery := make(map[time.Month]bool)
	// Iterate by adding months in case the dates span years (e.g. 12/1/2020 - 1/1/2022)
	for d := startDate; !d.After(endDate); d = d.AddDate(0, 1, 0) {
		monthsToQuery[d.Month()] = true
	}
	if len(rule.RecurringMonths) == 0 {
		// If no months are specified, then the rule applies to all months
		for month := range monthsToQuery {
			matchingMonths = append(matchingMonths, month)
		}
	} else {
		for _, month := range rule.RecurringMonths {
			if _, ok := monthsToQuery[time.Month(month)]; ok {
				matchingMonths = append(matchingMonths, time.Month(month))
			}
		}
	}

	return matchingMonths
}
