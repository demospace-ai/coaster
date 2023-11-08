package bookings

import (
	"crypto/rand"
	"fmt"
	"strings"
	"time"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

const BOOKING_REFERNECE_CHARS = 16

type BookingDetails struct {
	models.Booking
	Listing      models.Listing
	Payments     []models.Payment
	HostName     string
	BookingImage BookingImage
}

type BookingImage struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
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

func LoadByReferenceAndUserID(db *gorm.DB, bookingReference string, userID int64) (*models.Booking, error) {
	var booking models.Booking

	result := db.Table("bookings").
		Select("bookings.*").
		Where("bookings.reference = ?", bookingReference).
		Where("bookings.user_id = ?", userID).
		Where("bookings.deactivated_at IS NULL").
		Take(&booking)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(bookings.LoadByReferenceAndUserID)")
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

// Deprecated: use create temporary booking then update the expiration to confirm
func CreateBooking(db *gorm.DB, listingID int64, userID int64, startDate time.Time, startTime *time.Time, numGuests int64) (*models.Booking, error) {
	reference, err := generateReference()
	if err != nil {
		return nil, errors.Wrap(err, "(bookings.CreateTemporaryBooking) generating reference")
	}

	booking := &models.Booking{
		ListingID: listingID,
		UserID:    userID,
		StartDate: database.Date(startDate),
		Guests:    numGuests,
		Reference: *reference,
		Status:    models.BookingStatusPending,
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
	reference, err := generateReference()
	if err != nil {
		return nil, errors.Wrap(err, "(bookings.CreateTemporaryBooking) generating reference")
	}

	booking := &models.Booking{
		ListingID: listingID,
		UserID:    userID,
		StartDate: database.Date(startDate),
		Guests:    numGuests,
		ExpiresAt: &expiration,
		Reference: *reference,
		Status:    models.BookingStatusPending,
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

func CompleteBooking(db *gorm.DB, booking *models.Booking) error {
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

func generateReference() (*string, error) {
	b := make([]byte, BOOKING_REFERNECE_CHARS/2) // 2 chars per byte
	_, err := rand.Read(b)
	if err != nil {
		return nil, errors.Wrap(err, "(bookings.generateReference)")
	}

	reference := strings.ToUpper(fmt.Sprintf("C%x", b))
	reference = reference[:len(reference)-1] // We added a C at the beginning, so trim one character off the end
	return &reference, nil
}
