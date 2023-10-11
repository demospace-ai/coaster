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

type CreateCheckoutLinkRequest struct {
	ListingID      int64   `json:"listing_id"`
	StartDate      string  `json:"start_date"`
	StartTime      *string `json:"start_time"`
	NumberOfGuests int64   `json:"number_of_guests"`
}

func (s ApiService) CreateCheckoutLink(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var createCheckoutLinkRequest CreateCheckoutLinkRequest
	err := decoder.Decode(&createCheckoutLinkRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLinkLink) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(createCheckoutLinkRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) validating request")
	}

	listing, err := listings.LoadDetailsByIDAndUser(s.db, createCheckoutLinkRequest.ListingID, auth.User)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) loading listing")
	}

	startDate, err := time.Parse(time.DateOnly, createCheckoutLinkRequest.StartDate)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) parsing start date")
	}

	var startTime *time.Time
	if createCheckoutLinkRequest.StartTime != nil {
		parsedTime, err := time.Parse(time.TimeOnly, *createCheckoutLinkRequest.StartTime)
		if err != nil {
			return errors.Wrap(err, "(api.CreateCheckoutLink) parsing start time")
		}

		startTime = &parsedTime
	}

	// Create the booking here
	booking, err := bookings.CreateTemporaryBooking(s.db, listing.ID, auth.User.ID, startDate, startTime, createCheckoutLinkRequest.NumberOfGuests)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) creating temporary booking")
	}

	checkoutLink, err := stripe.GetCheckoutLink(auth.User, listing.Host, &listing.Listing, booking)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) error creating account link")
	}

	return json.NewEncoder(w).Encode(*checkoutLink)
}
