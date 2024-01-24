package api

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/stripe/stripe-go/v75"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/emails"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/events"
	"go.fabra.io/server/common/images"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/bookings"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/repositories/payments"
	"go.fabra.io/server/common/repositories/users"
	stripeutils "go.fabra.io/server/common/stripe"
	"go.fabra.io/server/common/timeutils"
)

func (s ApiService) WebhookStripe(w http.ResponseWriter, r *http.Request) error {
	signature := r.Header.Get("Stripe-Signature")
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookStripe) reading request body")
	}

	event, err := stripeutils.VerifyWebhookRequest(payload, signature)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookStripe) verifying webhook request")
	}

	// TODO: handle checkout.session.async_payment_succeeded and checkout.session.async_payment_failed
	switch event.Type {
	case "checkout.session.completed":
		return s.handleCheckoutComplete(event)
	case "checkout.session.expired":
		return s.handleCheckoutExpired(event)
	default:
		return errors.Newf("Unexpected event type: %v", event.Type)
	}
}

func (s ApiService) handleCheckoutExpired(event *stripe.Event) error {
	checkoutSession, err := stripeutils.UnmarshallCheckoutSession(event)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) unmarshalling checkout session")
	}

	strBookingID := checkoutSession.Metadata["booking_id"]
	if strBookingID == "" {
		return errors.Newf("No booking ID in checkout session metadata: %+v", checkoutSession)
	}

	bookingID, err := strconv.ParseInt(strBookingID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) converting booking ID to int")
	}

	err = bookings.DeactivateBooking(s.db, bookingID)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutExpired) confirming booking")
	}

	return nil
}

func (s ApiService) handleCheckoutComplete(event *stripe.Event) error {
	checkoutSession, err := stripeutils.UnmarshallCheckoutSession(event)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookStripe) unmarshalling checkout session")
	}

	// TODO: use client reference ID instead of metadata
	strBookingID := checkoutSession.Metadata["booking_id"]
	if strBookingID == "" {
		return errors.Newf("No booking ID in checkout session metadata: %+v", checkoutSession)
	}

	bookingID, err := strconv.ParseInt(strBookingID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) converting booking ID to int")
	}

	booking, err := bookings.LoadByID(s.db, bookingID)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) loading booking")
	}

	err = bookings.CompleteBooking(s.db, booking)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) confirming booking")
	}

	err = payments.CompletePayment(s.db, checkoutSession)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) recording payment")
	}

	user, err := users.LoadUserByID(s.db, booking.UserID)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) loading user")
	}

	listing, err := listings.LoadDetailsByIDAndUser(s.db, booking.ListingID, user)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) loading listing")
	}

	err = sendConfirmationEmail(listing, booking, user)
	if err != nil {
		return errors.Wrap(err, "(api.WebhookCheckoutComplete) sending confirmation email")
	}

	events.TrackBooking(user.ID, listing.Listing, checkoutSession.AmountTotal, booking.Guests, checkoutSession.ID, booking.ID)

	return nil
}

func sendConfirmationEmail(listing *listings.ListingDetails, booking *models.Booking, user *models.User) error {
	var domain string
	if application.IsProd() {
		domain = "https://www.trycoaster.com"
	} else {
		domain = "http://localhost:3000"
	}

	listingImageURL := images.GetGcsImageUrl(listing.Images[0].StorageID)
	startDateString := getStartDateString(booking.StartDate.ToTime(), booking.StartTime.ToTimePtr(), listing.AvailabilityType)
	durationString := getDurationString(*listing.DurationMinutes)

	var html bytes.Buffer
	CONFIRMATION_TEMPLATE.Execute(&html, ConfirmationTemplateArgs{
		ListingImageURL: listingImageURL,
		ListingName:     *listing.Name,
		ListingID:       fmt.Sprintf("%d", listing.ID),
		HostName:        listing.Host.FirstName,
		DurationString:  durationString,
		StartDate:       startDateString,
		Domain:          domain,
	})

	var plain bytes.Buffer
	CONFIRMATION_PLAIN_TEMPLATE.Execute(&plain, ConfirmationTemplateArgs{
		ListingName:    *listing.Name,
		ListingID:      fmt.Sprintf("%d", listing.ID),
		HostName:       listing.Host.FirstName,
		DurationString: durationString,
		StartDate:      startDateString,
		Domain:         domain,
	})

	err := emails.SendEmail("Coaster <support@trycoaster.com>", user.Email, "Booking request sent", html.String(), plain.String())
	if err != nil {
		return errors.Wrap(err, "(api.sendInvite) sending email")
	}

	return nil
}

func getStartDateString(startDate time.Time, startTime *time.Time, availabilityType models.AvailabilityType) string {
	if availabilityType == models.AvailabilityTypeDate {
		return startDate.Format("January 2, 2006")
	} else {
		combined := timeutils.CombineDateAndTime(startDate, *startTime)
		return combined.Format("January 2, 2006 at 3:04 PM")
	}
}

func getDurationString(durationMinutes int64) string {
	if durationMinutes > 1440 {
		days := durationMinutes / 1440
		if days > 1 {
			return fmt.Sprintf("%d days", days)
		} else {
			return fmt.Sprintf("%d day", days)
		}
	} else if durationMinutes > 60 {
		hours := durationMinutes / 60
		if hours > 1 {
			return fmt.Sprintf("%d hours", hours)
		} else {
			return fmt.Sprintf("%d hour", hours)
		}
	} else {
		return fmt.Sprintf("%d minutes", durationMinutes)
	}
}

type ConfirmationTemplateArgs struct {
	ListingImageURL string
	ListingName     string
	ListingID       string
	HostName        string
	DurationString  string
	StartDate       string
	Domain          string
}

var CONFIRMATION_TEMPLATE = template.Must(template.New("confirmation").Parse(CONFIRMATION_TEMPLATE_STRING))

const CONFIRMATION_TEMPLATE_STRING = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
<html lang="en">

  <head></head>
  <div id="email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
		Coaster Confirmation
  </div>

  <body style="background-color:#f6f9fc;padding:10px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;">
    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:40em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
      <tr style="width:100%">
        <td><img alt="Coaster" src="https://www.trycoaster.com/icon.png" height="40" style="display:block;outline:none;border:none;text-decoration:none" />
          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <p style="font-size:32px;line-height:1.3;margin:24px 0 0 0;font-weight:700;color:black">Your request was sent.</p>
                <p style="font-size:16px;line-height:26px;margin:12px 0 0 0;font-weight:300;color:#404040">This is not a confirmed booking until your guide approves the request. You'll get a response within 72 hours.</p>
                <a style="text-decoration:none" href="{{.Domain}}/listings/{{.ListingID}}">
									<img src="{{.ListingImageURL}}" style="display:block;width:100%;height:320px;object-fit:cover;border-radius:12px;margin-top:20px"/>
                  <p style="font-size:18px;line-height:26px;margin:16px 0 0 0;margin-bottom:0;font-weight:700;color:#404040">{{.ListingName}}</p>
                  <p style="font-size:16px;line-height:26px;margin:4px 0 0 0;font-weight:400;color:#404040">Trip hosted by {{.HostName}}</p>
                </a>
                <p style="border-bottom:1px solid lightgray; margin:24px 0 0 0;"></p>
                <p style="font-size:18px;line-height:26px;margin:16px 0 0 0;margin-bottom:0;font-weight:700;color:#404040">Dates</p>
                <p style="font-size:16px;line-height:26px;margin:12px 0;font-weight:300;color:#404040">{{.DurationString}} starting {{.StartDate}}</p>
                <p style="border-bottom:1px solid lightgray; margin:24px 0;"></p>
                <p style="font-size:16px;line-height:26px;margin:20px 0 0 0;font-weight:300;color:#404040">You won't be charged until your reservation is confirmed.</p>
                <p style="border-bottom:1px solid lightgray; margin:24px 0;"></p>
                <a href="{{.Domain}}/reservations" target="_blank" style="display:flex;background-color:#3673aa;border-radius:4px;border:1px solid #3673aa;color:black;color:#fff;font-size:16px;text-decoration:none;justify-content:center;padding:14px 7px;width:100%;line-height:100%;font-weight:500">Go to your trips</a>
                <a href="{{.Domain}}/reservations" target="_blank" style="margin-top:12px;display:flex;background-color:#ffffff;border-radius:4px;border: 1px solid black;color:black;font-size:16px;text-decoration:none;justify-content:center;display:flex;width:100%;padding:14px 7px;line-height:100%;font-weight:500">Cancel Request</a>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </table>
		<div style="width:100%;text-align:center;color:#404040;margin-top:12px;font-size:14px">Coaster, 2261 Market Street STE 5450, San Francisco, CA 94114</div>
  </body>

</html>
`

var CONFIRMATION_PLAIN_TEMPLATE = template.Must(template.New("confirmation_plain").Parse(CONFIRMATION_PLAIN_TEMPLATE_STRING))

const CONFIRMATION_PLAIN_TEMPLATE_STRING = `
	Your request was sent.

	This is not a confirmed booking until your guide approves the request. You'll get a response within 24 hours.

	{{.ListingName}}
	Trip hosted by {{.HostName}}

	Dates
	{{.DurationString}} starting {{.StartDate}}

	You won't be charged until your reservation is confirmed.

	Go to your trips: {{.Domain}}/reservations
	Cancel Request: {{.Domain}}/reservations

	Coaster, 2261 Market Street STE 5450, San Francisco, CA 94114
`
