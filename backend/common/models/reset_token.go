package models

type ResetToken struct {
	UserID int64
	Token  string

	BaseModel
}
