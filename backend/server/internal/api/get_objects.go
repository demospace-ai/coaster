package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/objects"
)

type GetObjectsResponse struct {
	Objects []models.Object `json:"objects"`
}

func (s ApiService) GetObjects(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	objects, err := objects.LoadAllObjects(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetObjectsResponse{
		objects,
	})
}
