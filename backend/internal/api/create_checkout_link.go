package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/stripe"
)

type CreateCheckoutRequest struct {
	ListingID      int64   `json:"listing_id"`
	StartDate      string  `json:"start_date"`
	StartTime      *string `json:"start_time"`
	NumberOfGuests int64   `json:"number_of_guests"`
}

func (s ApiService) CreateCheckout(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var createCheckoutRequest CreateCheckoutRequest
	err := decoder.Decode(&createCheckoutRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckout) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(createCheckoutRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckout) validating request")
	}

	// TODO: Check if the listing is still available for the date and time requested (time not needed for date-only listings)
	// TODO: add date and time slot to the checkout link metadata so we can record this for the booking
	// TODO: create a booking hold that expires in 10 minutes and check this when checking availability

	// add expires field to bookings table, check this when loading listings
	// add the booking ID to the checkout link metadata so on the completion webhook we can remove the expires value

	listing, err := listings.LoadDetailsByIDAndUser(s.db, createCheckoutRequest.ListingID, auth.User)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckout) loading listing")
	}

	startDate, err := time.Parse(time.DateOnly, createCheckoutRequest.StartDate)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckout) parsing start date")
	}

	var startTime *time.Time
	if createCheckoutRequest.StartTime != nil {
		parsedTime, err := time.Parse(time.TimeOnly, *createCheckoutRequest.StartTime)
		if err != nil {
			return errors.Wrap(err, "(api.CreateCheckout) parsing start time")
		}

		startTime = &parsedTime
	}

	// Create the booking here
	booking, err := bookings.CreateTemporaryBooking(s.db, listing.ID, startDate, startTime, createCheckoutRequest.NumberOfGuests)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckout) creating temporary booking")
	}

	checkoutLink, err := stripe.GetCheckoutLink(auth.User, listing.Host, &listing.Listing, booking)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckout) error creating account link")
	}

	return json.NewEncoder(w).Encode(*checkoutLink)
}
