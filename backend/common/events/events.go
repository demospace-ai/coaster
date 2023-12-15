package events

import (
	"fmt"

	"github.com/rudderlabs/analytics-go"
	"go.fabra.io/server/common/application"
)

func TrackSignup(userID int64, firstName string, lastName string, email string) {
	if !application.IsProd() {
		return
	}

	client := analytics.New("2Va8zq1kRrOOFb9sK4MYOrqPFbr", "https://trycoasterlyoh.dataplane.rudderstack.com")

	// Enqueues a track event that will be sent asynchronously.
	client.Enqueue(analytics.Track{
		UserId: fmt.Sprintf("%d", userID),
		Event:  "User Signup",
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

func TrackBooking(userID int64, listingID int64) {
	track(userID, "Trip Booked", analytics.NewProperties().
		Set("listingID", listingID))
}

func TrackCheckoutOpen(userID int64) {
	track(userID, "Checkout Open", nil)
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
