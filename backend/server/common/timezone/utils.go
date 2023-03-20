package timezone

import (
	"net/http"
	"time"
)

func GetTimezoneHeader(r *http.Request) *time.Location {
	timezone := r.Header.Get("X-TIME-ZONE")
	if timezone == "" {
		return time.UTC
	}

	loc, err := time.LoadLocation(timezone)
	if err != nil {
		return time.UTC
	}

	return loc
}
