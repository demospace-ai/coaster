package events

import (
	"fmt"

	"github.com/rudderlabs/analytics-go"
)

func TrackSignup(userID int64, name string, email string) {
	client := analytics.New("2DuH7iesuV4TtpwMqRvXqQttOvm", "https://fabranickbele.dataplane.rudderstack.com")

	// Enqueues a track event that will be sent asynchronously.
	client.Enqueue(analytics.Track{
		UserId: fmt.Sprintf("%d", userID),
		Event:  "User Signup",
	})

	// Enqueues an identify event that will be sent asynchronously.
	client.Enqueue(analytics.Identify{
		UserId: fmt.Sprintf("%d", userID),
		Traits: analytics.NewTraits().
			SetName(name).
			SetEmail(email),
	})

	// Flushes any queued messages and closes the client.
	client.Close()
}
