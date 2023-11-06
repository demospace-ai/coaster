package bookings

import (
	"time"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

type BookingDetails struct {
	models.Booking
	Listing         models.Listing
	HostName        string
	ListingImageURL string
}

func LoadBookingsForTimeAndDate(db *gorm.DB, listingID int64, startTime *database.Time, startDate time.Time) ([]models.Booking, error) {
	var bookings []models.Booking
	var result *gorm.DB

	// Listings with date-only availability don't have a start time on their bookings
	if startTime == nil {
		result = db.Table("bookings").
			Select("bookings.*").
			Where("bookings.listing_id = ?", listingID).
			Where("bookings.start_time IS NULL").
			Where("bookings.start_date = ?", startDate).
			Where("bookings.expires_at >= ? OR bookings.expires_at IS NULL", time.Now()).
			Where("bookings.deactivated_at IS NULL").
			Find(&bookings)
	} else {
		result = db.Table("bookings").
			Select("bookings.*").
			Where("bookings.listing_id = ?", listingID).
			Where("bookings.start_time = ?", startTime).
			Where("bookings.start_date = ?", startDate).
			Where("bookings.expires_at >= ? OR bookings.expires_at IS NULL", time.Now()).
			Where("bookings.deactivated_at IS NULL").
			Find(&bookings)
	}

	if result.Error != nil {
		// Not guaranteed to have any bookings so just return an empty slice
		if errors.IsRecordNotFound(result.Error) {
			return []models.Booking{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(bookings.LoadBookingsForTimeAndDate)")
		}
	}

	return bookings, nil
}

func LoadTemporaryBookingsForUser(db *gorm.DB, listingID int64, userID int64) ([]models.Booking, error) {
	var bookings []models.Booking

	result := db.Table("bookings").
		Select("bookings.*").
		Where("bookings.listing_id = ?", listingID).
		Where("bookings.user_id = ?", userID).
		Where("bookings.expires_at >= ?", time.Now()).
		Where("bookings.deactivated_at IS NULL").
		Find(&bookings)

	if result.Error != nil {
		// Not guaranteed to have any bookings so just return an empty slice
		if errors.IsRecordNotFound(result.Error) {
			return []models.Booking{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(bookings.LoadTemporaryBookingsForUser)")
		}
	}

	return bookings, nil
}

func LoadBookingsForUser(db *gorm.DB, userID int64) ([]models.Booking, error) {
	var bookings []models.Booking

	result := db.Table("bookings").
		Select("bookings.*").
		Where("bookings.user_id = ?", userID).
		Where("bookings.expires_at IS NULL").
		Where("bookings.deactivated_at IS NULL").
		Find(&bookings)

	if result.Error != nil {
		// Not guaranteed to have any bookings so just return an empty slice
		if errors.IsRecordNotFound(result.Error) {
			return []models.Booking{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(bookings.LoadBookingsForUser)")
		}
	}

	return bookings, nil
}

func LoadByIDAndUserID(db *gorm.DB, bookingID int64, userID int64) (*models.Booking, error) {
	var booking models.Booking

	result := db.Table("bookings").
		Select("bookings.*").
		Where("bookings.id = ?", bookingID).
		Where("bookings.user_id = ?", userID).
		Where("bookings.deactivated_at IS NULL").
		Take(&booking)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(bookings.LoadByIDAndUserID)")
	}

	return &booking, nil
}

func LoadByID(db *gorm.DB, bookingID int64) (*models.Booking, error) {
	var booking models.Booking

	result := db.Table("bookings").
		Select("bookings.*").
		Where("bookings.id = ?", bookingID).
		Where("bookings.deactivated_at IS NULL").
		Take(&booking)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(bookings.LoadByID)")
	}

	return &booking, nil
}

func CreateBooking(db *gorm.DB, listingID int64, userID int64, startDate time.Time, startTime *time.Time, numGuests int64) (*models.Booking, error) {
	booking := &models.Booking{
		ListingID: listingID,
		UserID:    userID,
		StartDate: database.Date(startDate),
		Guests:    numGuests,
	}
	if startTime != nil {
		startTime := database.Time(*startTime)
		booking.StartTime = &startTime
	}

	result := db.Create(booking)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(bookings.CreateBooking)")
	}

	return booking, nil
}

func CreateTemporaryBooking(db *gorm.DB, listingID int64, userID int64, startDate time.Time, startTime *time.Time, numGuests int64) (*models.Booking, error) {
	expiration := time.Now().Add(10 * time.Minute)
	booking := &models.Booking{
		ListingID: listingID,
		UserID:    userID,
		StartDate: database.Date(startDate),
		Guests:    numGuests,
		ExpiresAt: &expiration,
	}
	if startTime != nil {
		startTime := database.Time(*startTime)
		booking.StartTime = &startTime
	}

	result := db.Create(booking)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(bookings.CreateTemporaryBooking)")
	}

	return booking, nil
}

func AddCheckoutLink(db *gorm.DB, booking *models.Booking, checkoutLink string) error {
	booking.CheckoutLink = &checkoutLink
	result := db.Save(booking)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(bookings.AddCheckoutLink)")
	}

	return nil
}

func ConfirmBooking(db *gorm.DB, booking *models.Booking) error {
	booking.ExpiresAt = nil
	result := db.Save(booking)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(bookings.ConfirmBooking)")
	}

	return nil
}

func DeactivateBooking(db *gorm.DB, bookingID int64) error {
	result := db.Table("bookings").
		Where("id = ?", bookingID).
		Update("deactivated_at", time.Now())
	if result.Error != nil {
		return errors.Wrap(result.Error, "(bookings.DeactivateBooking)")
	}

	return nil
}
