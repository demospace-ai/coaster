package views

import "go.coaster.io/server/common/repositories/tags"

type Tag struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`

	Listings []Listing `json:"listings"`
}

func ConvertTag(tag tags.TagDetails) Tag {
	return Tag{
		Slug:        tag.Slug,
		Title:       tag.Title,
		Description: tag.Description,
		ImageURL:    tag.ImageURL,
		Listings:    ConvertListings(tag.Listings),
	}
}
