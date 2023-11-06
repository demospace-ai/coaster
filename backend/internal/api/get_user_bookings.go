package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/images"
	booking_lib "go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetUserBookings(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	bookings, err := booking_lib.LoadBookingsForUser(s.db, auth.User.ID)
	if err != nil {
		return errors.Wrap(err, "(api.GetBookings) loading bookings")
	}

	bookingDetails := make([]booking_lib.BookingDetails, len(bookings))
	for i := range bookings {
		listing, err := listings.LoadDetailsByIDAndUser(s.db, bookings[i].ListingID, auth.User)
		if err != nil {
			return errors.Wrap(err, "(bookings.LoadBookingsForUser)")
		}

		bookingDetails[i] = booking_lib.BookingDetails{
			Booking:         bookings[i],
			Listing:         listing.Listing,
			HostName:        listing.Host.FirstName,
			ListingImageURL: images.GetGcsImageUrl(listing.Images[0].StorageID),
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertBookings(bookingDetails))
}
