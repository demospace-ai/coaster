package api

import (
	"encoding/json"
	"net/http"

	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/images"
	booking_lib "go.coaster.io/server/common/repositories/bookings"
	"go.coaster.io/server/common/repositories/listings"
	"go.coaster.io/server/common/views"
)

func (s ApiService) GetUserBookings(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	bookings, err := booking_lib.LoadBookingsForUser(s.db, auth.User.ID)
	if err != nil {
		return errors.Wrap(err, "(api.GetUserBookings) loading bookings")
	}

	bookingDetails := make([]booking_lib.BookingDetails, len(bookings))
	for i := range bookings {
		listing, err := listings.LoadDetailsByIDAndUser(s.db, bookings[i].ListingID, auth.User)
		if err != nil {
			return errors.Wrap(err, "(api.GetUserBookings) loading listing details for booking")
		}

		bookingDetails[i] = booking_lib.BookingDetails{
			Booking:  bookings[i],
			Listing:  listing.Listing,
			HostName: listing.Host.FirstName,
			BookingImage: booking_lib.BookingImage{
				URL:    images.GetGcsImageUrl(listing.Images[0].StorageID),
				Width:  listing.Images[0].Width,
				Height: listing.Images[0].Height,
			},
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertBookings(bookingDetails))
}
