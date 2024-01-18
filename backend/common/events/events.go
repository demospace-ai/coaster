package events

import (
	"fmt"

	"github.com/rudderlabs/analytics-go"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/models"
)

func TrackSignup(userID int64, firstName string, lastName string, email string) {
	if !application.IsProd() {
		return
	}

	client := analytics.New("2Va8zq1kRrOOFb9sK4MYOrqPFbr", "https://trycoasterlyoh.dataplane.rudderstack.com")

	// Enqueues a track event that will be sent asynchronously.
	client.Enqueue(analytics.Track{
		UserId: fmt.Sprintf("%d", userID),
		Event:  "user_signup",
		Properties: analytics.NewProperties().
			Set("first_name", firstName).
			Set("last_name", lastName).
			Set("email", email),
	})

	// Enqueues an identify event that will be sent asynchronously.
	client.Enqueue(analytics.Identify{
		UserId: fmt.Sprintf("%d", userID),
		Traits: analytics.NewTraits().
			SetFirstName(firstName).
			SetLastName(lastName).
			SetEmail(email),
	})

	// Flushes any queued messages and closes the client.
	client.Close()
}

func TrackBooking(userID int64, listing models.Listing, revenue int64, numGuests int64) {
	track(userID, "trip_booked", analytics.NewProperties().
		Set("listing_id", listing.ID).
		Set("revenue", revenue).
		Set("products", []Product{
			{
				ID:       fmt.Sprintf("%d", listing.ID),
				Price:    float64(*listing.Price),
				Quantity: numGuests,
			},
		}))
}

func TrackCheckoutOpen(userID int64, listing models.Listing, revenue int64, numGuests int64) {
	track(userID, "checkout_open", analytics.NewProperties().
		Set("listing_id", listing.ID).
		Set("revenue", revenue).
		Set("products", []Product{
			{
				ID:       fmt.Sprintf("%d", listing.ID),
				Price:    float64(*listing.Price),
				Quantity: numGuests,
			},
		}))
}

type Product struct {
	ID       string  `json:"id,omitempty"`
	SKU      string  `json:"sky,omitempty"`
	Name     string  `json:"name,omitempty"`
	Price    float64 `json:"price"`
	Quantity int64   `json:"quantity"`
}

func track(userID int64, eventName string, properties analytics.Properties) {
	if !application.IsProd() {
		return
	}

	client := analytics.New("2Va8zq1kRrOOFb9sK4MYOrqPFbr", "https://trycoasterlyoh.dataplane.rudderstack.com")

	// Enqueues a track event that will be sent asynchronously.
	client.Enqueue(analytics.Track{
		UserId:     fmt.Sprintf("%d", userID),
		Event:      eventName,
		Properties: properties,
	})

	// Flushes any queued messages and closes the client.
	client.Close()
}
