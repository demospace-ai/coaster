package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/stripe"
)

type CreateCheckoutLinkRequest struct {
	ListingID      int64          `json:"listing_id"`
	StartDate      database.Date  `json:"start_date"`
	StartTime      *database.Time `json:"start_time"`
	NumberOfGuests int64          `json:"number_of_guests"`
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

	availabilityRules, err := availability_rules.LoadForListing(s.db, listing.ID)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) loading availability rules")
	}

	hasCapacity := false
	for _, rule := range availabilityRules {
		rulePasses, err := rule.HasAvailabilityForTarget(s.db, createCheckoutLinkRequest.StartDate.ToTime(), createCheckoutLinkRequest.StartTime.ToTimePtr(), listing.Listing)
		if err != nil {
			return errors.Wrap(err, "(api.CreateCheckoutLink) checking availability rule")
		}

		if rulePasses {
			hasCapacity = true
			break
		}
	}

	if !hasCapacity {
		return errors.NewCustomerVisibleError("This listing is not available for the selected date and time.")
	}

	booking, err := bookings.CreateTemporaryBooking(s.db, listing.ID, auth.User.ID, createCheckoutLinkRequest.StartDate.ToTime(), createCheckoutLinkRequest.StartTime.ToTimePtr(), createCheckoutLinkRequest.NumberOfGuests)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) creating temporary booking")
	}

	checkoutLink, err := stripe.GetCheckoutLink(auth.User, listing.Host, &listing.Listing, booking)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) error creating account link")
	}

	return json.NewEncoder(w).Encode(*checkoutLink)
}
