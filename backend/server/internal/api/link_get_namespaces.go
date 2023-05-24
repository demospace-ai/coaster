package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/sources"
)

func (s ApiService) LinkGetNamespaces(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	if auth.LinkToken == nil {
		return errors.NewBadRequest("must send link token")
	}

	strSourceId := r.URL.Query().Get("sourceID")
	if len(strSourceId) == 0 {
		return errors.Newf("missing source ID from LinkGetNamespaces request URL (LinkGetNamespaces): %s", r.URL.RequestURI())
	}

	sourceId, err := strconv.ParseInt(strSourceId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "LinkGetNamespaces")
	}

	// TODO: write test to make sure only authorized users can use the data connection
	// Needed to ensure end customer ID encoded by the link token owns the source/connection
	source, err := sources.LoadSourceByID(s.db, auth.Organization.ID, auth.LinkToken.EndCustomerID, sourceId)
	if err != nil {
		return errors.Wrap(err, "LinkGetNamespaces")
	}

	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, source.ConnectionID)
	if err != nil {
		return errors.Wrap(err, "LinkGetNamespaces")
	}

	namespaces, err := s.queryService.GetNamespaces(context.TODO(), connection)
	if err != nil {
		return errors.Wrap(err, "LinkGetNamespaces")
	}

	return json.NewEncoder(w).Encode(GetNamespacesResponse{
		Namespaces: namespaces,
	})
}
