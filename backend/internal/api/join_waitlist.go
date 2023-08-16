package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/users"
)

type JoinWaitlistRequest struct {
	Phone string `json:"phone" validate:"required"`
}

func (s ApiService) JoinWaitlist(w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var joinWaitlistRequest JoinWaitlistRequest
	err := decoder.Decode(&joinWaitlistRequest)
	if err != nil {
		return errors.Wrap(err, "(api.JoinWaitlist) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(joinWaitlistRequest)
	if err != nil {
		return errors.Wrap(err, "(api.JoinWaitlist) validating request")
	}

	err = users.JoinWaitlist(s.db, joinWaitlistRequest.Phone)
	if err != nil {
		return errors.Wrap(err, "(api.JoinWaitlist) joining waitlist")
	}

	return nil
}
