package errors

import (
	"errors"
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

type CustomerVisibleError struct {
	message string
}

func (e CustomerVisibleError) Error() string {
	return e.message
}

type HttpError struct {
	code int
	CustomerVisibleError
}

func (e HttpError) Code() int {
	return e.code
}

var NotFound = HttpError{
	code: http.StatusNotFound,
	CustomerVisibleError: CustomerVisibleError{
		message: http.StatusText(http.StatusNotFound),
	},
}

var BadRequest = HttpError{
	code: http.StatusBadRequest,
	CustomerVisibleError: CustomerVisibleError{
		message: http.StatusText(http.StatusBadRequest),
	},
}

var Unauthorized = HttpError{
	code: http.StatusUnauthorized,
	CustomerVisibleError: CustomerVisibleError{
		message: http.StatusText(http.StatusUnauthorized),
	},
}

var Forbidden = HttpError{
	code: http.StatusForbidden,
	CustomerVisibleError: CustomerVisibleError{
		message: "User inactive",
	},
}

func NewCustomerVisibleError(err error) CustomerVisibleError {
	return CustomerVisibleError{
		message: err.Error(),
	}
}

func NewBadRequest(clientVisibleData string) error {
	return HttpError{
		code: http.StatusBadRequest,
		CustomerVisibleError: CustomerVisibleError{
			message: clientVisibleData,
		},
	}
}

func NewBadRequestf(clientVisibleDataFormat string, args ...any) error {
	return HttpError{
		code: http.StatusBadRequest,
		CustomerVisibleError: CustomerVisibleError{
			message: fmt.Sprintf(clientVisibleDataFormat, args...),
		},
	}
}

func Wrap(err error, message string) error {
	return fmt.Errorf("%s: %w", message, err)
}

func Wrapf(err error, format string, args ...any) error {
	message := fmt.Sprintf(format, args...)
	return Wrap(err, message)
}

func New(message string) error {
	return fmt.Errorf(message)
}

func Newf(format string, a ...any) error {
	return fmt.Errorf(format, a...)
}

func IsRecordNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}

func IsCookieNotFound(err error) bool {
	return errors.Is(err, http.ErrNoCookie)
}

func As(err error, target interface{}) bool {
	return errors.As(err, target)
}
