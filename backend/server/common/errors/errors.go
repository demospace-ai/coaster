package errors

import (
	"net/http"

	"github.com/pkg/errors"
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
	return errors.Wrap(err, message)
}

func Wrapf(err error, format string, args ...any) error {
	return errors.Wrapf(err, format, args)
}

func New(message string) error {
	return errors.New(message)
}

func Newf(format string, a ...any) error {
	return errors.Errorf(format, a)
}

func WithStack(err error) error {
	return err
}

func IsRecordNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}

func IsCookieNotFound(err error) bool {
	return errors.Is(err, http.ErrNoCookie)
}
