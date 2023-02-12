package models

type ModelField struct {
	ModelID int64  `json:"model_id"`
	Name    string `json:"name"`
	Type    string `json:"type"`

	BaseModel
}
