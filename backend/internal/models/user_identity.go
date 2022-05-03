package models

type UserIdentity struct {
	FirstName string
	LastName  string
	UserID    int64

	BaseModel
}
