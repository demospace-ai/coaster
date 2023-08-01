package views

import (
	"go.fabra.io/server/common/models"
)

type Listing struct {
	ID          int64           `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Category    models.Category `json:"category"`
	Price       int64           `json:"price"`
	Location    string          `json:"location"`
}

func ConvertListings(listings []models.Listing) []Listing {
	converted := make([]Listing, len(listings))
	for i, listing := range listings {
		converted[i] = ConvertListing(listing)
	}

	return converted
}

func ConvertListing(listing models.Listing) Listing {
	return Listing{
		ID:          listing.ID,
		Name:        listing.Name,
		Description: listing.Description,
		Category:    listing.Category,
		Price:       listing.Price,
		Location:    listing.Location,
	}
}
