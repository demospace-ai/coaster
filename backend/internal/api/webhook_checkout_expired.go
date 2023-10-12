package api

import (
	"io"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/bookings"
	stripeutils "go.fabra.io/server/common/stripe"
)

func (s ApiService) WebhookCheckoutExpired(w http.ResponseWriter, r *http.Request) error {
	signature := r.Header.Get("Stripe-Signature")
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) reading request body")
	}

	event, err := stripeutils.VerifyWebhookRequest(payload, signature)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) verifying webhook request")
	}

	if event.Type != "checkout.session.expired" {
		return errors.Newf("Unexpected event type: %v", event.Type)
	}

	checkoutSession, err := stripeutils.UnmarshallCheckoutSession(event)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) unmarshalling checkout session")
	}

	strBookingID := checkoutSession.Metadata["booking_id"]
	if strBookingID == "" {
		return errors.Newf("No booking ID in checkout session metadata: %+v", checkoutSession)
	}

	bookingID, err := strconv.ParseInt(strBookingID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) converting booking ID to int")
	}

	err = bookings.DeactivateBooking(s.db, bookingID)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) confirming booking")
	}

	return nil
}
