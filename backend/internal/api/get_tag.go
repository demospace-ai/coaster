package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/repositories/tags"
	"go.coaster.io/server/common/views"
)

func (s ApiService) GetTag(w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	slug, ok := vars["slug"]
	if !ok {
		return errors.Newf("(api.GetTag) missing slug from GetTag request URL: %s", r.URL.RequestURI())
	}

	tag, err := tags.LoadBySlug(
		s.db,
		slug,
	)
	if err != nil {
		if errors.IsRecordNotFound(err) {
			return errors.NotFound
		} else {
			return errors.Wrap(err, "(api.GetTag) loading tag")
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertTag(*tag))
}
