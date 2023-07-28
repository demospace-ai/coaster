package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/objects"
)

type GetObjectsResponse struct {
	Objects []models.Object `json:"objects"`
}

func (s ApiService) GetObjects(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	strDestinationID := r.URL.Query().Get("destinationID")
	if len(strDestinationID) > 0 {
		destinationID, err := strconv.ParseInt(strDestinationID, 10, 64)
		if err != nil {
			return errors.Wrap(err, "(api.GetObjects)")
		}

		objects, err := objects.LoadObjectsByDestination(s.db, auth.Organization.ID, destinationID)
		if err != nil {
			return errors.Wrap(err, "(api.GetObjects)")
		}

		return json.NewEncoder(w).Encode(GetObjectsResponse{objects})
	}

	objects, err := objects.LoadAllObjects(s.db, auth.Organization.ID)
	if err != nil {
		return errors.Wrap(err, "(api.GetObjects)")
	}

	return json.NewEncoder(w).Encode(GetObjectsResponse{
		objects,
	})
}
