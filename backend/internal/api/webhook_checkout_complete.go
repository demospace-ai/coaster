package api

import (
	"net/http"
)

func (s ApiService) WebhookCheckoutComplete(w http.ResponseWriter, r *http.Request) error {
	// TODO: authenticate request from Stripe
	// Update booking from metadata to not expire anymore

	return nil
}
