package database

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"go.fabra.io/server/common/errors"
)

type Date time.Time

func (date *Date) Scan(value interface{}) (err error) {
	nullTime := &sql.NullTime{}
	err = nullTime.Scan(value)
	*date = Date(nullTime.Time)
	return
}

func (date Date) Value() (driver.Value, error) {
	y, m, d := time.Time(date).Date()
	return time.Date(y, m, d, 0, 0, 0, 0, time.Time(date).Location()), nil
}

func (d Date) ToTime() time.Time {
	return time.Time(d)
}

func (d *Date) ToTimePtr() *time.Time {
	if d == nil {
		return nil
	}

	tptr := time.Time(*d)
	return &tptr
}

// GormDataType gorm common data type
func (Date) GormDataType() string {
	return "DATE"
}

func (date Date) GobEncode() ([]byte, error) {
	return time.Time(date).GobEncode()
}

func (date *Date) GobDecode(b []byte) error {
	return (*time.Time)(date).GobDecode(b)
}

func (date Date) MarshalJSON() ([]byte, error) {
	return time.Time(date).MarshalJSON()
}

func (date *Date) UnmarshalJSON(b []byte) error {
	return (*time.Time)(date).UnmarshalJSON(b)
}

// Time is time data type.
type Time time.Time

// NewTime is a constructor for Time and returns new Time.
func NewTime(hour, min, sec int) Time {
	return newTime(hour, min, sec)
}

func newTime(hour, min, sec int) Time {
	return Time(time.Date(1970, 1, 1, hour, min, sec, 0, time.UTC))
}

// GormDataType returns gorm common data type. This type is used for the field's column type.
func (Time) GormDataType() string {
	return "TIME"
}

func (t Time) ToTime() time.Time {
	return time.Time(t)
}

func (t *Time) ToTimePtr() *time.Time {
	if t == nil {
		return nil
	}

	tptr := time.Time(*t)
	return &tptr
}

// Scan implements sql.Scanner interface and scans value into Time,
func (t *Time) Scan(src interface{}) error {
	switch v := src.(type) {
	case []byte:
		t.setFromString(string(v))
	case string:
		t.setFromString(v)
	case time.Time:
		t.setFromTime(v)
	default:
		return errors.New(fmt.Sprintf("failed to scan value: %v", v))
	}

	return nil
}

func (t *Time) setFromString(str string) {
	var h, m, s int
	fmt.Sscanf(str, "%02d:%02d:%02d", &h, &m, &s)
	*t = newTime(h, m, s)
}

func (t *Time) setFromJson(str string) {
	var h, m, s int
	// We expect input times to be formatted as ISO strings on Jan 1st 1970.
	fmt.Sscanf(str, "1970-01-01T%02d:%02d:%02d.000Z", &h, &m, &s)
	*t = newTime(h, m, s)
}

func (t *Time) setFromTime(src time.Time) {
	*t = newTime(src.Hour(), src.Minute(), src.Second())
}

// Value implements driver.Valuer interface and returns string format of Time.
func (t Time) Value() (driver.Value, error) {
	return t.String(), nil
}

// String implements fmt.Stringer interface.
func (t Time) String() string {
	return fmt.Sprintf("%02d:%02d:%02d", t.hours(), t.minutes(), t.seconds())
}

func (t Time) hours() int {
	return time.Time(t).Hour()
}

func (t Time) minutes() int {
	return time.Time(t).Minute()
}

func (t Time) seconds() int {
	return time.Time(t).Second()
}

// MarshalJSON implements json.Marshaler to convert Time to json serialization.
func (t Time) MarshalJSON() ([]byte, error) {
	return json.Marshal(t.String())
}

// UnmarshalJSON implements json.Unmarshaler to deserialize json data.
func (t *Time) UnmarshalJSON(data []byte) error {
	// ignore null
	if string(data) == "null" {
		return nil
	}
	t.setFromJson(strings.Trim(string(data), `"`))
	return nil
}

type Month time.Month

func (month *Month) Scan(value interface{}) (err error) {
	nullMonth := &sql.NullInt16{}
	err = nullMonth.Scan(value)
	*month = Month(nullMonth.Int16)
	return
}

func (month Month) Value() (driver.Value, error) {
	return time.Month(month), nil
}

// GormDataType gorm common data type
func (Month) GormDataType() string {
	return "SMALLINT"
}
