package events

import (
	"fmt"

	"github.com/rudderlabs/analytics-go"
)

func Track(userID int64, event string) {
	client := analytics.New("2DuH7iesuV4TtpwMqRvXqQttOvm", "https://fabranickbele.dataplane.rudderstack.com")

	// Enqueues a track event that will be sent asynchronously.
	client.Enqueue(analytics.Track{
		UserId: fmt.Sprintf("%d", userID),
		Event:  event,
	})

	// Flushes any queued messages and closes the client.
	client.Close()
}
