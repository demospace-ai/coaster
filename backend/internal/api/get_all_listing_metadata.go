package api

import (
	"encoding/json"
	"net/http"

	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/repositories/listings"
)

func (s ApiService) GetAllListingMetadata(w http.ResponseWriter, r *http.Request) error {
	// TODO: This should be an authenticated route
	listingMetadataList, err := listings.LoadAllPublishedMetadata(s.db)
	if err != nil {
		return errors.Wrap(err, "(api.SearchListings) loading listings filtered by category")
	}

	return json.NewEncoder(w).Encode(listingMetadataList)
}
