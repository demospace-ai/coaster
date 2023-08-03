package models

import "go.fabra.io/server/common/geo"

type Category string

const (
	CategorySurfing Category = "surfing"
)

type Listing struct {
	UserID      int64     `json:"user_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    Category  `json:"category"`
	Price       int64     `json:"price"`
	Location    string    `json:"location"`
	Coordinates geo.Point `json:"coordinates"`
	Published   bool      `json:"published"`
	Featured    bool      `json:"featured"`

	BaseModel
}

type ListingImage struct {
	ListingID int64  `json:"listing_id"`
	StorageID string `json:"storage_id"`

	BaseModel
}
