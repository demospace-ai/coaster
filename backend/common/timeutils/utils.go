package timeutils

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"go.fabra.io/server/common/errors"
)

const DAY = time.Hour * 24
const WEEK = DAY * 7

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

func GetDurationString(duration time.Duration) (*string, error) {
	var output []string
	remaining := duration.Truncate(time.Second).String()

	hSplit := strings.Split(remaining, "h")
	if len(hSplit) == 1 {
		remaining = hSplit[0]
	} else {
		hours, err := strconv.Atoi(hSplit[0])
		if err != nil {
			return nil, errors.Wrap(err, "(timeutils.GetDurationString)")
		}

		if hours == 1 {
			output = append(output, fmt.Sprintf("%d hour", hours))
		} else if hours > 0 {
			output = append(output, fmt.Sprintf("%d hours", hours))
		}
		remaining = hSplit[1]
	}

	mSplit := strings.Split(remaining, "m")
	if len(mSplit) == 1 {
		remaining = mSplit[0]
	} else {
		minutes, err := strconv.Atoi(mSplit[0])
		if err != nil {
			return nil, errors.Wrap(err, "(timeutils.GetDurationString)")
		}

		if minutes == 1 {
			output = append(output, fmt.Sprintf("%d minute", minutes))
		} else if minutes > 0 {
			output = append(output, fmt.Sprintf("%d minutes", minutes))
		}
		remaining = mSplit[1]
	}

	sSplit := strings.Split(remaining, "s")
	if len(sSplit) == 1 {
	} else {
		seconds, err := strconv.Atoi(sSplit[0])
		if err != nil {
			return nil, errors.Wrap(err, "(timeutils.GetDurationString)")
		}

		if seconds == 1 {
			output = append(output, fmt.Sprintf("%d second", seconds))
		} else if seconds > 0 {
			output = append(output, fmt.Sprintf("%d seconds", seconds))
		}
	}

	outputStr := strings.Join(output, " ")

	// Just say it took 1 second if it was shorter. No one will care
	if outputStr == "" {
		outputStr = "1 second"
	}

	return &outputStr, nil
}

func BetweenOrEqual(t time.Time, start time.Time, end time.Time) bool {
	return t.Compare(start) > -1 && t.Compare(end) < 1
}

// TODO: there must be a better way than just looping
func FirstDayOfWeekInMonth(year int, month time.Month, dayOfWeek time.Weekday) time.Time {
	day := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	for ; day.Weekday() != dayOfWeek; day = day.AddDate(0, 0, 1) {
	}
	return day
}

func TimesMatch(t1 *time.Time, t2 *time.Time) bool {
	if t1 == nil && t2 == nil {
		return true
	}

	if t1 == nil || t2 == nil {
		return false
	}

	return t1.Hour() == t2.Hour() && t1.Minute() == t2.Minute() && t1.Second() == t2.Second()
}


func CombineDateAndTime(date time.Time, timeValue time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), timeValue.Hour(), timeValue.Minute(), timeValue.Second(), 0, time.UTC)
}
