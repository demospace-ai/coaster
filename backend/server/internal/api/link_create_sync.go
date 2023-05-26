package api

import (
	"encoding/json"
	"net/http"
	"time"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
)

const DAY = time.Hour * 24
const WEEK = DAY * 7

func (s ApiService) LinkCreateSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "(api.LinkCreateSync)")
	}

	if auth.LinkToken == nil {
		return errors.Wrap(errors.NewBadRequest("must send link token"), "(api.LinkCreateSync)")
	}

	decoder := json.NewDecoder(r.Body)
	var createSyncRequest CreateSyncRequest
	err := decoder.Decode(&createSyncRequest)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	// TODO: validate connection parameters
	validate := validator.New()
	err = validate.Struct(createSyncRequest)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	// Do NOT use the end customer ID from the request— we must pull it from the link token to ensure
	// the customer is authorized.
	sync, fieldMappings, err := s.createSync(auth, createSyncRequest, auth.LinkToken.EndCustomerID)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	return json.NewEncoder(w).Encode(CreateSyncResponse{
		Sync:          views.ConvertSync(sync),
		FieldMappings: views.ConvertFieldMappings(fieldMappings),
	})
}

func createSchedule(frequency int64, frequencyUnits models.FrequencyUnits) (time.Duration, error) {
	frequencyDuration := time.Duration(frequency)
	switch frequencyUnits {
	case models.FrequencyUnitsMinutes:
		return frequencyDuration * time.Minute, nil
	case models.FrequencyUnitsHours:
		return frequencyDuration * time.Hour, nil
	case models.FrequencyUnitsDays:
		return frequencyDuration * DAY, nil
	case models.FrequencyUnitsWeeks:
		return frequencyDuration * WEEK, nil
	default:
		// TODO: this should not happen
		return WEEK, errors.Newf("(api.createSchedule) unexpected frequency unit: %s", string(frequencyUnits))
	}
}
