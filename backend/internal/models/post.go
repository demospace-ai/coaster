package models

import "fabra/internal/database"

type PostType string

const (
	PostTypeQuestion PostType = "question"
	PostTypeAnswer   PostType = "answer"
)

// TODO: marshal to externally-friendly json
type Post struct {
	PostType     PostType            `json:"post_type"`
	Title        database.NullString `json:"title,omitempty"`
	Body         string              `json:"body"`
	UserID       int64               `json:"user_id"`
	ParentPostID database.NullInt64  `json:"parent_post_id,omitempty"`

	BaseModel
}
