package api

import (
	"io"
	"net/http"
	"strconv"

	"github.com/stripe/stripe-go/v75"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/bookings"
	stripeutils "go.fabra.io/server/common/stripe"
)

func (s ApiService) WebhookCheckoutComplete(w http.ResponseWriter, r *http.Request) error {
	// TODO: authenticate request from Stripe
	// Update booking from metadata to not expire anymore
	signature := r.Header.Get("Stripe-Signature")
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) reading request body")
	}

	event, err := stripeutils.VerifyWebhookRequest(payload, signature)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) verifying webhook request")
	}

	// TODO: handle checkout.session.async_payment_succeeded and checkout.session.async_payment_failed
	switch event.Type {
	case "checkout.session.completed":
		err = s.handleCheckoutComplete(event)
		if err != nil {
			return errors.Wrap(err, "(api.WebhookCheckoutComplete) handling checkout complete")
		}
	default:
		return errors.Newf("Unexpected event type: %v", event.Type)
	}

	return nil
}

func (s ApiService) handleCheckoutComplete(event *stripe.Event) error {
	checkoutSession, err := stripeutils.UnmarshallCheckoutComplete(event)
	if err != nil {
		return errors.Wrap(err, "(api.handleCheckoutComplete) unmarshalling checkout session")
	}

	strBookingID := checkoutSession.Metadata["booking_id"]
	if strBookingID == "" {
		return errors.Newf("No booking ID in checkout session metadata: %+v", checkoutSession)
	}

	bookingID, err := strconv.ParseInt(strBookingID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.handleCheckoutComplete) converting booking ID to int")
	}

	err = bookings.ConfirmBooking(s.db, bookingID)
	if err != nil {
		return errors.Wrap(err, "(api.handleCheckoutComplete) confirming booking")
	}

	return nil
}
