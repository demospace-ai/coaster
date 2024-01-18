package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/events"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/repositories/payments"
	"go.fabra.io/server/common/stripe"
	"go.fabra.io/server/common/timeutils"
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

	temporaryBookings, err := bookings.LoadTemporaryBookingsForUser(s.db, listing.ID, auth.User.ID)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) loading temporary bookings")
	}

	for _, booking := range temporaryBookings {
		if booking.StartDate.ToTime().Equal(createCheckoutLinkRequest.StartDate.ToTime()) && timeutils.TimesMatch(booking.StartTime.ToTimePtr(), createCheckoutLinkRequest.StartTime.ToTimePtr()) {
			if booking.Guests != createCheckoutLinkRequest.NumberOfGuests {
				// TODO: there is a chance that someone else grabs the availability between the time we release the hold and create the new one
				// Previous booking had a different quantity, release the hold and create a new one
				err = bookings.DeactivateBooking(s.db, booking.ID)
				if err != nil {
					return errors.Wrap(err, "(api.CreateCheckoutLink) updating number of guests")
				}
				break
			} else {
				// If the user has an active hold for this date/time/numGuests, just re-use the checkout link
				payment, err := payments.LoadOpenForBooking(s.db, &booking)
				if err != nil {
					return errors.Wrapf(err, "(api.CreateCheckoutLink) loading payment for booking %d", booking.ID)
				}
				return json.NewEncoder(w).Encode(payment.CheckoutLink)
			}
		}
	}

	// Availability check must happen after we release any temporary holds this user had above
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

	checkoutSession, err := stripe.CreateCheckoutSession(auth.User, listing, booking)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) error creating account link")
	}

	// TODO: Adding this after creating the booking is kind of ugly, is there a better way?
	_, err = payments.CreatePayment(s.db, booking, checkoutSession)
	if err != nil {
		return errors.Wrap(err, "(api.CreateCheckoutLink) adding checkout link")
	}

	events.TrackCheckoutOpen(auth.User.ID, listing.ID, checkoutSession.AmountTotal)

	return json.NewEncoder(w).Encode(checkoutSession.URL)
}
