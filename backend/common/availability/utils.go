package availability

import (
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/timeutils"
	"gorm.io/gorm"
)

type RuleAndTimes struct {
	models.AvailabilityRule
	TimeSlots []models.TimeSlot
}

func (rule RuleAndTimes) GetAvailabilityInRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]time.Time, error) {
	switch rule.Type {
	case models.AvailabilityRuleTypeFixedDate:
		return rule.GetAvailabilityInRangeFixedDate(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeFixedRange:
		return rule.GetAvailabilityInRangeFixedRange(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeRecurring:
		return rule.GetAvailabilityInRangeRecurring(db, startDate, endDate, listing)
	default:
		// TODO: this should never happen
		return nil, errors.Newf("(availability.GetAvailabilityForMonth) Unknown availability rule type: %s", rule.Type)
	}
}

func (rule RuleAndTimes) GetAvailabilityInRangeFixedDate(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]time.Time, error) {
	var availability []time.Time
	if timeutils.BetweenOrEqual(time.Time(*rule.StartDate), startDate, endDate) {
		for _, timeSlot := range rule.TimeSlots {
			// All the time slots will be for this single fixed date, so check if any have availability
			hasCapacity, err := rule.HasCapacityForDay(db, time.Time(*rule.StartDate), timeSlot, listing)
			if err != nil {
				return nil, errors.Wrap(err, "(availability.GetAvailabilityInRangeFixedDate)")
			}

			if hasCapacity {
				var availableDay time.Time
				if listing.AvailabilityType == models.AvailabilityTypeDateTime {
					availableDay = combineDateAndTime(time.Time(*rule.StartDate), time.Time(*timeSlot.StartTime))
				} else {
					availableDay = time.Time(*rule.StartDate)
				}

				availability = append(availability, availableDay)
			}
		}
	}

	return availability, nil
}

// True if any of the available dates are between the start and end date
func (rule RuleAndTimes) GetAvailabilityInRangeFixedRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]time.Time, error) {
	availabilityMap := make(map[time.Time]bool)

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
					return nil, errors.Wrap(err, "(availability.GetAvailabilityInRangeFixedRange)")
				}

				if hasCapacity {
					var availableDay time.Time
					if listing.AvailabilityType == models.AvailabilityTypeDateTime {
						availableDay = combineDateAndTime(d, time.Time(*timeSlot.StartTime))
					} else {
						availableDay = d
					}

					availabilityMap[availableDay] = true
				}
			}
		}
	}

	availability := make([]time.Time, len(availabilityMap))
	i := 0
	for day := range availabilityMap {
		availability[i] = day
		i++
	}
	return availability, nil
}

func (rule RuleAndTimes) GetAvailabilityInRangeRecurring(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]time.Time, error) {
	availabilityMap := make(map[time.Time]bool)

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
							return nil, errors.Wrap(err, "(availability.GetAvailabilityInRangeRecurring)")
						}

						if hasCapacity {
							var availableDay time.Time
							if listing.AvailabilityType == models.AvailabilityTypeDateTime {
								availableDay = combineDateAndTime(d, time.Time(*timeSlot.StartTime))
							} else {
								availableDay = d
							}

							availabilityMap[availableDay] = true
						}
					}
				}
			}
		}
	}

	availability := make([]time.Time, len(availabilityMap))
	i := 0
	for day := range availabilityMap {
		availability[i] = day
		i++
	}
	return availability, nil
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
		return false, errors.Newf("(availability.HasAvailabilityInRange) Unknown availability rule type: %s", rule.Type)
	}
}

// True if the available date is between the start and end date
func (rule RuleAndTimes) HasAvailabilityInRangeFixedDate(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	if timeutils.BetweenOrEqual(time.Time(*rule.StartDate), startDate, endDate) {
		for _, timeSlot := range rule.TimeSlots {
			// All the time slots will be for this single fixed date, so check if any have availability
			hasCapacity, err := rule.HasCapacityForDay(db, time.Time(*rule.StartDate), timeSlot, listing)
			if err != nil {
				return false, errors.Wrap(err, "(availability.HasAvailabilityInRangeRecurring)")
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
					return false, errors.Wrap(err, "(availability.HasAvailabilityInRangeRecurring)")
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
							return false, errors.Wrap(err, "(availability.HasAvailabilityInRangeRecurring)")
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
	bookings, err := bookings.LoadBookingsForTimeAndDate(db, listing.ID, timeSlot.StartTime, targetDate)
	if err != nil {
		return false, errors.Wrap(err, "(availability.HasCapacityForDay) loading bookings")
	}

	if listing.MaxGuests == nil {
		return false, errors.Newf("(availability.HasCapacityForDay) listing %d does not have a max guest count", listing.ID)
	}

	capacity := *listing.MaxGuests
	if timeSlot.Capacity != nil {
		capacity = *timeSlot.Capacity
	}

	usedCapacity := int64(0)
	for _, booking := range bookings {
		usedCapacity += booking.Guests
	}

	remainingCapacity := capacity - usedCapacity
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

func combineDateAndTime(date time.Time, timeValue time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), timeValue.Hour(), timeValue.Minute(), timeValue.Second(), 0, time.UTC)
}
