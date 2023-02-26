package models

import "go.fabra.io/server/common/database"

type ObjectField struct {
	ObjectID    int64               `json:"object_id"`
	Name        string              `json:"name"`
	Type        string              `json:"type"`
	DisplayName database.NullString `json:"display_name"`
	Description database.NullString `json:"description"`
	Omit        bool                `json:"omit"`

	BaseModel
}
