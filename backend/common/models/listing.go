package models

import (
	"go.fabra.io/server/common/geo"
)

type ListingCategory string

const (
	CategorySurfing    ListingCategory = "surfing"
	CategorySkiing     ListingCategory = "skiing"
	CategoryFishing    ListingCategory = "fishing"
	CategoryHiking     ListingCategory = "hiking"
	CategoryCamping    ListingCategory = "camping"
	CategoryCycling    ListingCategory = "cycling"
	CategoryBoating    ListingCategory = "boating"
	CategoryClimbing   ListingCategory = "climbing"
	CategoryDiving     ListingCategory = "diving"
	CategorySnorkeling ListingCategory = "snorkeling"
	CategoryHunting    ListingCategory = "hunting"
)

type ListingStatus string

const (
	ListingStatusPublished   ListingStatus = "published"
	ListingStatusDraft       ListingStatus = "draft"
	ListingStatusUnderReview ListingStatus = "review"
)

type Listing struct {
	UserID      int64            `json:"user_id"`
	Name        *string          `json:"name"`
	Description *string          `json:"description"`
	Category    *ListingCategory `json:"category"`
	Price       *int64           `json:"price"`
	Location    *string          `json:"location"`
	Coordinates *geo.Point       `json:"coordinates"`
	Status      ListingStatus    `json:"status"`
	Featured    bool             `json:"featured"`

	BaseModel
}

type ListingImage struct {
	ListingID int64  `json:"listing_id"`
	StorageID string `json:"storage_id"`

	BaseModel
}
