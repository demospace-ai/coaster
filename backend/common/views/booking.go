package views

import (
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/bookings"
)

type Booking struct {
	Reference    string                `json:"reference"`
	StartTime    *database.Time        `json:"start_time"` // Can be null for date-only listings
	StartDate    database.Date         `json:"start_date"` // Must have date because time slots can be used for more than one days
	Guests       int64                 `json:"guests"`
	Status       models.BookingStatus  `json:"status"`
	Listing      models.Listing        `json:"listing"`
	ListingHost  string                `json:"listing_host"`
	Payments     []models.Payment      `json:"payments"`
	BookingImage bookings.BookingImage `json:"booking_image"`
}

func ConvertBooking(booking bookings.BookingDetails) Booking {
	return Booking{
		Reference:    booking.Reference,
		StartTime:    booking.StartTime,
		StartDate:    booking.StartDate,
		Guests:       booking.Guests,
		Status:       booking.Status,
		Listing:      booking.Listing,
		ListingHost:  booking.HostName,
		Payments:     booking.Payments,
		BookingImage: booking.BookingImage,
	}
}

func ConvertBookings(bookings []bookings.BookingDetails) []Booking {
	bookingViews := make([]Booking, len(bookings))
	for i, booking := range bookings {
		bookingViews[i] = ConvertBooking(booking)
	}

	return bookingViews
}
