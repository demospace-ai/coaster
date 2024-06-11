package tags

import (
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/models"
	"go.coaster.io/server/common/repositories/listings"
	"gorm.io/gorm"
)

type TagDetails struct {
	models.Tag
	Listings []listings.ListingDetails `json:"listings"`
}

func LoadBySlug(db *gorm.DB, slug string) (*TagDetails, error) {
	var tag models.Tag
	result := db.Table("tags").
		Select("tags.*").
		Where("tags.slug = ?", slug).
		Take(&tag)

	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(tags.LoadBySlug) error for tag %s", slug)
	}

	listings, err := listings.LoadListingsForTag(db, tag.ID)
	if err != nil {
		return nil, errors.Wrapf(err, "(tags.LoadBySlug) error loading listings for tag %s", slug)
	}

	return &TagDetails{
		tag,
		listings,
	}, nil
}
