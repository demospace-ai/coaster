package input

import (
	"go.fabra.io/server/common/geo"
	"go.fabra.io/server/common/models"
)

type Listing struct {
	Name                *string                     `json:"name"`
	Description         *string                     `json:"description"`
	Price               *int64                      `json:"price"`
	Location            *string                     `json:"location"`
	Coordinates         *geo.Point                  `json:"coordinates"`
	PlaceID             *string                     `json:"place_id"`
	City                *string                     `json:"city"`
	Region              *string                     `json:"region"`
	Country             *string                     `json:"country"`
	PostalCode          *string                     `json:"postal_code"`
	Status              *models.ListingStatus       `json:"status"`
	ShortDescription    *string                     `json:"short_description"`
	Cancellation        *models.ListingCancellation `json:"cancellation"`
	DurationMinutes     *int64                      `json:"duration_minutes"`
	MaxGuests           *int64                      `json:"max_guests"`
	Highlights          []string                    `json:"highlights"`
	Includes            []string                    `json:"includes"`
	NotIncluded         []string                    `json:"not_included"`
	AvailabilityType    *models.AvailabilityType    `json:"availability_type"`
	AvailabilityDisplay *models.AvailabilityDisplay `json:"availability_display"`

	Categories []models.ListingCategoryType `json:"categories"`
}

type ListingImage struct {
	ID int64 `json:"id"`
}
