package models

import "database/sql"

type PostType string

const (
	PostTypeQuestion PostType = "question"
	PostTypeAnswer   PostType = "answer"
)

// TODO: add tsvector and company columns
type Post struct {
	PostType PostType
	Title    sql.NullString
	Body     string
	UserID   int64

	BaseModel
}
