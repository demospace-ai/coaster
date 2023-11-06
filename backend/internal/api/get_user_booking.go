package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/images"
	booking_lib "go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetUserBooking(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strBookingID, ok := vars["bookingID"]
	if !ok {
		return errors.Newf("(api.GetUserBooking) missing booking ID from GetUserBooking request URL: %s", r.URL.RequestURI())
	}

	bookingID, err := strconv.ParseInt(strBookingID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.GetUserBooking) parsing booking ID")
	}

	booking, err := booking_lib.LoadByIDAndUserID(s.db, bookingID, auth.User.ID)
	if err != nil {
		return errors.Wrap(err, "(api.GetUserBooking) loading bookings")
	}

	listing, err := listings.LoadDetailsByIDAndUser(s.db, booking.ListingID, auth.User)
	if err != nil {
		return errors.Wrap(err, "(api.GetUserBooking) loading listing details for booking")
	}

	return json.NewEncoder(w).Encode(views.ConvertBooking(booking_lib.BookingDetails{
		Booking:         *booking,
		Listing:         listing.Listing,
		HostName:        listing.Host.FirstName,
		ListingImageURL: images.GetGcsImageUrl(listing.Images[0].StorageID),
	}))
}
