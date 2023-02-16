package models

type ObjectField struct {
	ObjectID int64  `json:"object_id"`
	Name     string `json:"name"`
	Type     string `json:"type"`

	BaseModel
}
