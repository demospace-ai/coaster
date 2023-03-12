package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/views"
)

type GetObjectResponse struct {
	Object views.Object `json:"object"`
}

func (s ApiService) GetObject(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	strObjectId := r.URL.Query().Get("objectID")
	if len(strObjectId) == 0 {
		return errors.Newf("missing object ID from GetObjectSchema request URL: %s", r.URL.RequestURI())
	}

	objectId, err := strconv.ParseInt(strObjectId, 10, 64)
	if err != nil {
		return err
	}

	object, err := objects.LoadObjectByID(s.db, auth.Organization.ID, objectId)
	if err != nil {
		return err
	}

	// TODO: don't include the omitted fields on link token requests
	objectFields, err := objects.LoadObjectFieldsByID(s.db, object.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetObjectResponse{
		views.ConvertObject(object, objectFields),
	})
}
