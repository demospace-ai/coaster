package errors

import (
	"errors"
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

type HttpError struct {
	Code              int
	ClientVisibleData string
}

func (e HttpError) Error() string {
	return e.ClientVisibleData
}

var NotFound = HttpError{
	Code:              http.StatusNotFound,
	ClientVisibleData: http.StatusText(http.StatusNotFound),
}

var BadRequest = HttpError{
	Code:              http.StatusBadRequest,
	ClientVisibleData: http.StatusText(http.StatusBadRequest),
}

var Unauthorized = HttpError{
	Code:              http.StatusUnauthorized,
	ClientVisibleData: http.StatusText(http.StatusUnauthorized),
}

func NewBadRequest(clientVisibleData string) error {
	return HttpError{
		Code:              http.StatusBadRequest,
		ClientVisibleData: clientVisibleData,
	}
}

func Wrap(err error, message string) error {
	return fmt.Errorf("%s: %w", message, err)
}

func New(message string) error {
	return errors.New(message)
}

func Newf(format string, a ...any) error {
	message := fmt.Sprintf(format, a...)
	return errors.New(message)
}

func IsRecordNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}

func IsCookieNotFound(err error) bool {
	return errors.Is(err, http.ErrNoCookie)
}
