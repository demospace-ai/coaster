package bookings

import (
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

func LoadBookingsForTimeSlotAndDate(db *gorm.DB, targetDate time.Time, timeSlot models.TimeSlot) ([]models.Booking, error) {
	var bookings []models.Booking
	result := db.Table("bookings").
		Select("bookings.*").
		Where("bookings.time_slot_id = ?", timeSlot.ID).
		Where("bookings.start_date = ?", targetDate).
		Where("bookings.deactivated_at IS NULL").
		Find(&bookings)
	if result.Error != nil {
		// Not guaranteed to have any time slots for a rule so just return an empty slice
		if errors.IsRecordNotFound(result.Error) {
			return []models.Booking{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(availability_rules.LoadTimeSlotsForRule)")
		}
	}

	return nil, nil
}
