package payments

import (
	"time"

	"github.com/stripe/stripe-go/v75"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

func CreatePayment(db *gorm.DB, booking *models.Booking, checkoutSession *stripe.CheckoutSession) (*models.Payment, error) {
	payment := models.Payment{
		BookingID:    booking.ID,
		TotalAmount:  checkoutSession.AmountTotal,
		Currency:     checkoutSession.Currency,
		Status:       checkoutSession.Status,
		SessionID:    checkoutSession.ID,
		CheckoutLink: checkoutSession.URL,
	}

	result := db.Create(&payment)
	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(payments.CreatePayment) %+v", checkoutSession)
	}

	return &payment, nil
}

func CompletePayment(db *gorm.DB, checkoutSession *stripe.CheckoutSession) error {
	// Load by session ID not by booking ID since one day we might add multiple checkouts per booking
	payment, err := LoadBySessionID(db, checkoutSession.ID)
	if err != nil {
		return errors.Wrap(err, "(payments.CompletePayment) loading by session ID")
	}

	now := time.Now()
	payment.CompletedAt = &now
	payment.Status = checkoutSession.Status

	result := db.Save(&payment)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(payments.CompletePayment) saving payment")
	}

	return nil
}

func LoadBySessionID(db *gorm.DB, sessionID string) (*models.Payment, error) {
	var payment models.Payment
	result := db.Table("payments").
		Where("payments.session_id = ?", sessionID).
		Where("payments.deactivated_at IS NULL").
		Take(&payment)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(payments.LoadBySessionID)")
	}

	return &payment, nil
}

func LoadOpenForBooking(db *gorm.DB, booking *models.Booking) (*models.Payment, error) {
	var payment models.Payment
	result := db.Table("payments").
		Where("payments.booking_id = ?", booking.ID).
		Where("payments.status = ?", stripe.CheckoutSessionStatusOpen).
		Where("payments.deactivated_at IS NULL").
		Take(&payment)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(payments.LoadBySessionID)")
	}

	return &payment, nil
}

func LoadCompletedForBooking(db *gorm.DB, booking *models.Booking) ([]models.Payment, error) {
	var payments []models.Payment
	result := db.Table("payments").
		Where("payments.booking_id = ?", booking.ID).
		Where("payments.status = ?", stripe.CheckoutSessionStatusComplete).
		Where("payments.deactivated_at IS NULL").
		Find(&payments)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(payments.LoadBySessionID)")
	}

	return payments, nil
}
