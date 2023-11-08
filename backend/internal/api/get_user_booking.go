package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/images"
	booking_lib "go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/repositories/payments"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetUserBooking(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	bookingReference, ok := vars["bookingReference"]
	if !ok {
		return errors.Newf("(api.GetUserBooking) missing booking reference from GetUserBooking request URL: %s", r.URL.RequestURI())
	}

	booking, err := booking_lib.LoadByReferenceAndUserID(s.db, bookingReference, auth.User.ID)
	if err != nil {
		if errors.IsRecordNotFound(err) {
			return errors.NotFound
		} else {
			return errors.Wrap(err, "(api.GetUserBooking) loading bookings")
		}
	}

	listing, err := listings.LoadDetailsByIDAndUser(s.db, booking.ListingID, auth.User)
	if err != nil {
		return errors.Wrap(err, "(api.GetUserBooking) loading listing details for booking")
	}

	payments, err := payments.LoadCompletedForBooking(s.db, booking)
	if err != nil {
		return errors.Wrap(err, "(api.GetUserBooking) loading payment for booking")
	}

	return json.NewEncoder(w).Encode(views.ConvertBooking(booking_lib.BookingDetails{
		Booking:  *booking,
		HostName: listing.Host.FirstName,
		Listing:  listing.Listing,
		Payments: payments,
		BookingImage: booking_lib.BookingImage{
			URL:    images.GetGcsImageUrl(listing.Images[0].StorageID),
			Width:  listing.Images[0].Width,
			Height: listing.Images[0].Height,
		},
	}))
}
