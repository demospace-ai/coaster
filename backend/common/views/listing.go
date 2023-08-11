package views

import (
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/listings"
)

type Listing struct {
	ID          int64                   `json:"id"`
	Name        *string                 `json:"name"`
	Description *string                 `json:"description"`
	Category    *models.ListingCategory `json:"category"`
	Price       *int64                  `json:"price"`
	Location    *string                 `json:"location"`
	Coordinates *Coordinates            `json:"coordinates"`
	Images      []string                `json:"images"`
}

type Coordinates struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func ConvertListings(listings []listings.ListingAndImages) []Listing {
	converted := make([]Listing, len(listings))
	for i, listing := range listings {
		converted[i] = ConvertListing(listing)
	}

	return converted
}

func ConvertListing(listing listings.ListingAndImages) Listing {
	var coordinates *Coordinates
	if listing.Coordinates != nil {
		coordinates = &Coordinates{Latitude: listing.Coordinates.Latitude, Longitude: listing.Coordinates.Longitude}
	}
	return Listing{
		ID:          listing.ID,
		Name:        listing.Name,
		Description: listing.Description,
		Category:    listing.Category,
		Price:       listing.Price,
		Location:    listing.Location,
		Coordinates: coordinates,
		Images:      ConvertImages(listing.Images),
	}
}

func ConvertImages(images []models.ListingImage) []string {
	converted := make([]string, len(images))
	for i, image := range images {
		converted[i] = image.StorageID
	}

	return converted
}
