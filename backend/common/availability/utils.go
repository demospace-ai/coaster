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

type Availability struct {
	DateTime time.Time `json:"datetime"`
	Capacity int64     `json:"capacity"`
}

func (rule RuleAndTimes) GetAvailabilityInRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]Availability, error) {
	switch rule.Type {
	case models.AvailabilityRuleTypeFixedDate:
		return rule.getAvailabilityInRangeFixedDate(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeFixedRange:
		return rule.getAvailabilityInRangeFixedRange(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeRecurring:
		return rule.getAvailabilityInRangeRecurring(db, startDate, endDate, listing)
	default:
		// TODO: this should never happen
		return nil, errors.Newf("(availability.GetAvailabilityForMonth) Unknown availability rule type: %s", rule.Type)
	}
}

func (rule RuleAndTimes) getAvailabilityInRangeFixedDate(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]Availability, error) {
	var availability []Availability
	if timeutils.BetweenOrEqual(time.Time(*rule.StartDate), startDate, endDate) {
		for _, timeSlot := range rule.TimeSlots {
			// All the time slots will be for this single fixed date, so check if any have availability
			capacity, err := rule.GetCapacityForValidDay(db, time.Time(*rule.StartDate), timeSlot, listing)
			if err != nil {
				return nil, errors.Wrap(err, "(availability.GetAvailabilityInRangeFixedDate)")
			}

			if capacity > 0 {
				var availableDay time.Time
				if listing.AvailabilityType == models.AvailabilityTypeDateTime {
					availableDay = timeutils.CombineDateAndTime(time.Time(*rule.StartDate), time.Time(*timeSlot.StartTime))
				} else {
					availableDay = time.Time(*rule.StartDate)
				}

				availability = append(availability, Availability{
					DateTime: availableDay,
					Capacity: capacity,
				})
			}
		}
	}

	return availability, nil
}

// True if any of the available dates are between the start and end date
func (rule RuleAndTimes) getAvailabilityInRangeFixedRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]Availability, error) {
	availabilityMap := make(map[time.Time]int64)

	// Can have multiple time slots per day of the week
	timeSlotMap := make(map[time.Weekday][]models.TimeSlot)
	for _, timeSlot := range rule.TimeSlots {
		timeSlotMap[*timeSlot.DayOfWeek] = append(timeSlotMap[*timeSlot.DayOfWeek], timeSlot)
	}

	for d := time.Time(*rule.StartDate); !d.After(time.Time(*rule.EndDate)); d = d.AddDate(0, 0, 1) {
		if timeutils.BetweenOrEqual(d, startDate, endDate) {
			for _, timeSlot := range timeSlotMap[d.Weekday()] {
				capacity, err := rule.GetCapacityForValidDay(db, d, timeSlot, listing)
				if err != nil {
					return nil, errors.Wrap(err, "(availability.GetAvailabilityInRangeFixedRange)")
				}

				if capacity > 0 {
					var availableDay time.Time
					if listing.AvailabilityType == models.AvailabilityTypeDateTime {
						availableDay = timeutils.CombineDateAndTime(d, time.Time(*timeSlot.StartTime))
					} else {
						availableDay = d
					}

					availabilityMap[availableDay] = capacity
				}
			}
		}
	}

	availability := make([]Availability, len(availabilityMap))
	i := 0
	for day, capacity := range availabilityMap {
		availability[i] = Availability{
			DateTime: day,
			Capacity: capacity,
		}
		i++
	}
	return availability, nil
}

func (rule RuleAndTimes) getAvailabilityInRangeRecurring(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) ([]Availability, error) {
	availabilityMap := make(map[time.Time]int64)

	// Generate the list of matching years/months to check since the rule may span infinite years
	matchingYears := getMatchingYears(rule, startDate, endDate)
	matchingMonths := getMatchingMonths(rule, startDate, endDate)

	for _, year := range matchingYears {
		for _, month := range matchingMonths {
			for _, timeSlot := range rule.TimeSlots {
				// Increment by 7 days to get all the days of the week in the month
				for d := timeutils.FirstDayOfWeekInMonth(int(year), month, *timeSlot.DayOfWeek); d.Month() == month; d = d.AddDate(0, 0, 7) {
					if timeutils.BetweenOrEqual(d, startDate, endDate) {
						capacity, err := rule.GetCapacityForValidDay(db, d, timeSlot, listing)
						if err != nil {
							return nil, errors.Wrap(err, "(availability.GetAvailabilityInRangeRecurring)")
						}

						if capacity > 0 {
							var availableDay time.Time
							if listing.AvailabilityType == models.AvailabilityTypeDateTime {
								availableDay = timeutils.CombineDateAndTime(d, time.Time(*timeSlot.StartTime))
							} else {
								availableDay = d
							}

							availabilityMap[availableDay] = capacity
						}
					}
				}
			}
		}
	}

	availability := make([]Availability, len(availabilityMap))
	i := 0
	for day, capacity := range availabilityMap {
		availability[i] = Availability{
			DateTime: day,
			Capacity: capacity,
		}
		i++
	}
	return availability, nil
}

func (rule RuleAndTimes) HasAvailabilityInRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	switch rule.Type {
	case models.AvailabilityRuleTypeFixedDate:
		return rule.hasAvailabilityInRangeFixedDate(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeFixedRange:
		return rule.hasAvailabilityInRangeFixedRange(db, startDate, endDate, listing)
	case models.AvailabilityRuleTypeRecurring:
		return rule.hasAvailabilityInRangeRecurring(db, startDate, endDate, listing)
	default:
		// TODO: this should never happen
		return false, errors.Newf("(availability.HasAvailabilityInRange) Unknown availability rule type: %s", rule.Type)
	}
}

// True if the available date is between the start and end date
func (rule RuleAndTimes) hasAvailabilityInRangeFixedDate(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	if timeutils.BetweenOrEqual(time.Time(*rule.StartDate), startDate, endDate) {
		for _, timeSlot := range rule.TimeSlots {
			// All the time slots will be for this single fixed date, so check if any have availability
			hasCapacity, err := rule.HasCapacityForValidDay(db, time.Time(*rule.StartDate), timeSlot, listing)
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
func (rule RuleAndTimes) hasAvailabilityInRangeFixedRange(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	// Can have multiple time slots per day of the week
	timeSlotMap := make(map[time.Weekday][]models.TimeSlot)
	for _, timeSlot := range rule.TimeSlots {
		timeSlotMap[*timeSlot.DayOfWeek] = append(timeSlotMap[*timeSlot.DayOfWeek], timeSlot)
	}

	for d := time.Time(*rule.StartDate); !d.After(time.Time(*rule.EndDate)); d = d.AddDate(0, 0, 1) {
		if timeutils.BetweenOrEqual(d, startDate, endDate) {
			for _, timeSlot := range timeSlotMap[d.Weekday()] {
				hasCapacity, err := rule.HasCapacityForValidDay(db, d, timeSlot, listing)
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

func (rule RuleAndTimes) hasAvailabilityInRangeRecurring(db *gorm.DB, startDate time.Time, endDate time.Time, listing models.Listing) (bool, error) {
	// Generate the list of matching years/months to check since the rule may span infinite years
	matchingYears := getMatchingYears(rule, startDate, endDate)
	matchingMonths := getMatchingMonths(rule, startDate, endDate)

	for _, year := range matchingYears {
		for _, month := range matchingMonths {
			for _, timeSlot := range rule.TimeSlots {
				// Increment by 7 days to get all the days of the week in the month
				for d := timeutils.FirstDayOfWeekInMonth(int(year), month, *timeSlot.DayOfWeek); d.Month() == month; d = d.AddDate(0, 0, 7) {
					if timeutils.BetweenOrEqual(d, startDate, endDate) {
						hasCapacity, err := rule.HasCapacityForValidDay(db, d, timeSlot, listing)
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

func (rule RuleAndTimes) HasAvailabilityForTarget(db *gorm.DB, targetDate time.Time, targetTime *time.Time, listing models.Listing) (bool, error) {
	switch rule.Type {
	case models.AvailabilityRuleTypeFixedDate:
		return rule.hasAvailabilityForTargetFixedDate(db, targetDate, targetTime, listing)
	case models.AvailabilityRuleTypeFixedRange:
		return rule.hasAvailabilityForTargetFixedRange(db, targetDate, targetTime, listing)
	case models.AvailabilityRuleTypeRecurring:
		return rule.hasAvailabilityForTargetRecurring(db, targetDate, targetTime, listing)
	default:
		// TODO: this should never happen
		return false, errors.Newf("(availability.HasAvailabilityForTarget) Unknown availability rule type: %s", rule.Type)
	}
}

// True if the available date is between the start and end date
func (rule RuleAndTimes) hasAvailabilityForTargetFixedDate(db *gorm.DB, targetDate time.Time, targetTime *time.Time, listing models.Listing) (bool, error) {
	if time.Time(*rule.StartDate).Equal(targetDate) {
		for _, timeSlot := range rule.TimeSlots {
			// This will match for date-only listings since they will both be nil
			if timeutils.TimesMatch(targetTime, timeSlot.StartTime.ToTimePtr()) {
				hasCapacity, err := rule.HasCapacityForValidDay(db, targetDate, timeSlot, listing)
				if err != nil {
					return false, errors.Wrap(err, "(availability.hasAvailabilityForTargetFixedDate)")
				}

				if hasCapacity {
					return true, nil
				}
			}
		}
	}

	return false, nil
}

// True if any of the available dates are between the start and end date
func (rule RuleAndTimes) hasAvailabilityForTargetFixedRange(db *gorm.DB, targetDate time.Time, targetTime *time.Time, listing models.Listing) (bool, error) {
	// Can have multiple time slots per day of the week
	timeSlotMap := make(map[time.Weekday][]models.TimeSlot)
	for _, timeSlot := range rule.TimeSlots {
		timeSlotMap[*timeSlot.DayOfWeek] = append(timeSlotMap[*timeSlot.DayOfWeek], timeSlot)
	}

	if timeutils.BetweenOrEqual(targetDate, time.Time(*rule.StartDate), time.Time(*rule.EndDate)) {
		for _, timeSlot := range timeSlotMap[targetDate.Weekday()] {
			// This will match for date-only listings since they will both be nil
			if timeutils.TimesMatch(targetTime, timeSlot.StartTime.ToTimePtr()) {
				hasCapacity, err := rule.HasCapacityForValidDay(db, targetDate, timeSlot, listing)
				if err != nil {
					return false, errors.Wrap(err, "(availability.hasAvailabilityForTargetFixedRange)")
				}

				if hasCapacity {
					return true, nil
				}
			}
		}
	}

	return false, nil
}

func (rule RuleAndTimes) hasAvailabilityForTargetRecurring(db *gorm.DB, targetDate time.Time, targetTime *time.Time, listing models.Listing) (bool, error) {
	if !rule.matchesMonth(targetDate) || !rule.matchesYear(targetDate) {
		return false, nil
	}

	for _, timeSlot := range rule.TimeSlots {
		if *timeSlot.DayOfWeek != targetDate.Weekday() {
			continue
		}

		// This will match for date-only listings since they will both be nil
		if timeutils.TimesMatch(targetTime, timeSlot.StartTime.ToTimePtr()) {
			hasCapacity, err := rule.HasCapacityForValidDay(db, targetDate, timeSlot, listing)
			if err != nil {
				return false, errors.Wrap(err, "(availability.hasAvailabilityForTargetRecurring)")
			}

			if hasCapacity {
				return true, nil
			}
		}
	}

	return false, nil
}

// Assumes that the date has already been checked to match the rule
func (rule RuleAndTimes) HasCapacityForValidDay(db *gorm.DB, targetDate time.Time, timeSlot models.TimeSlot, listing models.Listing) (bool, error) {
	remainingCapacity, err := rule.GetCapacityForValidDay(db, targetDate, timeSlot, listing)
	if err != nil {
		return false, errors.Wrap(err, "(availability.HasCapacityForValidDay)")
	}

	return remainingCapacity > 0, nil
}

// Assumes that the date has already been checked to match the rule
func (rule RuleAndTimes) GetCapacityForValidDay(db *gorm.DB, targetDate time.Time, timeSlot models.TimeSlot, listing models.Listing) (int64, error) {
	bookings, err := bookings.LoadBookingsForTimeAndDate(db, listing.ID, timeSlot.StartTime, targetDate)
	if err != nil {
		return 0, errors.Wrap(err, "(availability.HasCapacityForDay) loading bookings")
	}

	if listing.MaxGuests == nil {
		return 0, errors.Newf("(availability.HasCapacityForDay) listing %d does not have a max guest count", listing.ID)
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
	return remainingCapacity, nil
}

func (rule RuleAndTimes) matchesYear(targetDate time.Time) bool {
	if len(rule.RecurringYears) == 0 {
		return true
	} else {
		for _, year := range rule.RecurringYears {
			if int(year) == targetDate.Year() {
				return true
			}
		}
	}

	return false
}

func (rule RuleAndTimes) matchesMonth(targetDate time.Time) bool {
	if len(rule.RecurringMonths) == 0 {
		return true
	} else {
		for _, month := range rule.RecurringMonths {
			if int(month) == int(targetDate.Month()) {
				return true
			}
		}
	}

	return false
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
		for year := startDate.Year(); year <= endDate.Year(); year++ {
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
