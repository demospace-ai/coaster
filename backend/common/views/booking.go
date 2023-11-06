package views

import (
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/repositories/bookings"
)

type Booking struct {
	ID              int64          `json:"id"`
	StartTime       *database.Time `json:"start_time"` // Can be null for date-only listings
	StartDate       database.Date  `json:"start_date"` // Must have date because time slots can be used for more than one days
	Guests          int64          `json:"guests"`
	ListingName     string         `json:"listing_name"`
	ListingHost     string         `json:"listing_host"`
	ListingImageURL string         `json:"listing_image_url"`
}

func ConvertBooking(booking bookings.BookingDetails) Booking {
	return Booking{
		ID:              booking.ID,
		StartTime:       booking.StartTime,
		StartDate:       booking.StartDate,
		Guests:          booking.Guests,
		ListingName:     *booking.Listing.Name,
		ListingHost:     booking.HostName,
		ListingImageURL: booking.ListingImageURL,
	}
}

func ConvertBookings(bookings []bookings.BookingDetails) []Booking {
	bookingViews := make([]Booking, len(bookings))
	for i, booking := range bookings {
		bookingViews[i] = ConvertBooking(booking)
	}

	return bookingViews
}
