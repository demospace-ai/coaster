package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/destinations"
	"go.fabra.io/server/common/repositories/objects"
)

func (s ApiService) GetObjectSchema(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	strObjectId := r.URL.Query().Get("objectID")
	if len(strObjectId) == 0 {
		return fmt.Errorf("missing object ID from GetObjectSchema request URL: %s", r.URL.RequestURI())
	}

	objectId, err := strconv.ParseInt(strObjectId, 10, 64)
	if err != nil {
		return nil
	}

	object, err := objects.LoadObjectByID(s.db, auth.Organization.ID, objectId)
	if err != nil {
		return err
	}

	destination, err := destinations.LoadDestinationByID(s.db, auth.Organization.ID, object.DestinationID)
	if err != nil {
		return err
	}

	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, destination.ConnectionID)
	if err != nil {
		return err
	}

	schema, err := s.queryService.GetTableSchema(context.TODO(), connection, object.Namespace, object.TableName)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: schema,
	})
}
