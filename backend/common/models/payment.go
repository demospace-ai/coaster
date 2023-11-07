package models

import (
	"time"

	"github.com/stripe/stripe-go/v75"
)

type Payment struct {
	UserID       int64                        `json:"-"`
	BookingID    int64                        `json:"-"`
	SessionID    string                       `json:"-"`
	TotalAmount  int64                        `json:"total_amount"`
	Currency     stripe.Currency              `json:"currency"`
	Status       stripe.CheckoutSessionStatus `json:"-"`
	CheckoutLink string                       `json:"-"`
	CompletedAt  *time.Time                   `json:"completed_at"`

	BaseModel
}
