package api

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/emails"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/reset_tokens"
	"go.fabra.io/server/common/repositories/users"
)

type SendInviteRequest struct {
	Emails []string `json:"emails" validate:"required,dive,email"`
}

type SendInviteTemplateArgs struct {
	SenderName string
	Email      string
	Domain     string
}

type SendCreatePasswordTemplateArgs struct {
	SenderName string
	FirstName  string
	Email      string
	Token      string
	Domain     string
}

func (s ApiService) SendInvite(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var sendInviteRequest SendInviteRequest
	err := decoder.Decode(&sendInviteRequest)
	if err != nil {
		return errors.Wrap(err, "(api.SendInvite) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(sendInviteRequest)
	if err != nil {
		return errors.Wrap(err, "(api.SendInvite) validating request")
	}

	for _, email := range sendInviteRequest.Emails {
		s.sendInvite(email, auth.User)
	}

	return nil
}

func (s ApiService) sendInvite(email string, sender *models.User) error {
	senderName := fmt.Sprintf("%s %s", sender.FirstName, sender.LastName)

	var domain string
	if application.IsProd() {
		domain = "https://www.trycoaster.com"
	} else {
		domain = "http://localhost:3000"
	}

	// TODO: rate limit emails
	user, err := users.LoadByEmail(s.db, email)
	if err != nil && !errors.IsRecordNotFound(err) {
		return errors.Wrap(err, "(api.sendInvite) unexpected error")
	}

	if err == nil {
		// Only admins can send invites for existing users
		if !sender.IsAdmin {
			fmt.Println("not admin")
			return nil
		}

		if user.IsHost && application.IsProd() {
			domain = "https://supplier.trycoaster.com"
		}

		// Invites for existing users are just password reset emails with a longer expiration. There isn't much
		// risk to using an extended expiration here since the account doesn't have any user-created data.
		token, err := reset_tokens.GetExtendedResetToken(s.db, user)
		if err != nil {
			return errors.Wrap(err, "(api.sendInvite) creating reset token")
		}

		var html bytes.Buffer
		SEND_CREATE_PASSWORD_TEMPLATE.Execute(&html, SendCreatePasswordTemplateArgs{
			SenderName: senderName,
			FirstName:  user.FirstName,
			Token:      token.Token,
			Domain:     domain,
		})

		var plain bytes.Buffer
		SEND_CREATE_PASSWORD_PLAIN_TEMPLATE.Execute(&plain, SendCreatePasswordTemplateArgs{
			SenderName: senderName,
			FirstName:  user.FirstName,
			Token:      token.Token,
			Domain:     domain,
		})

		fmt.Println("existing user email")
		err = emails.SendEmail("Coaster Support", "support@trycoaster.com", email, "Welcome to Coaster", html.String(), plain.String())
		if err != nil {
			return errors.Wrap(err, "(api.sendInvite) sending existing user email")
		}
	} else {
		encodedEmail := base64.StdEncoding.EncodeToString([]byte(email))
		var html bytes.Buffer
		SEND_INVITE_TEMPLATE.Execute(&html, SendInviteTemplateArgs{
			SenderName: senderName,
			Email:      encodedEmail,
			Domain:     domain,
		})

		var plain bytes.Buffer
		SEND_INVITE_PLAIN_TEMPLATE.Execute(&plain, SendInviteTemplateArgs{
			SenderName: senderName,
			Email:      encodedEmail,
			Domain:     domain,
		})

		err = emails.SendEmail("Coaster Support", "support@trycoaster.com", email, "You're invited to Coaster", html.String(), plain.String())
		if err != nil {
			return errors.Wrap(err, "(api.sendInvite) sending email")
		}
	}

	return nil
}

var SEND_INVITE_TEMPLATE = template.Must(template.New("invite").Parse(SEND_INVITE_TEMPLATE_STRING))

const SEND_INVITE_TEMPLATE_STRING = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
<html lang="en">

  <head></head>
  <div id="email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
		Coaster Invite
  </div>

  <body style="background-color:#f6f9fc;padding:10px 0">
    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
      <tr style="width:100%">
        <td><img alt="Coaster" src="https://www.trycoaster.com/long-logo.png" height="40" style="display:block;outline:none;border:none;text-decoration:none" />
          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <td>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Hi there!</p>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">{{.SenderName}} is inviting you to join Coaster, the best way to plan adventure travel! You can create an account here:</p><a href="{{.Domain}}/signup?email={{.Email}}&destination=profile" target="_blank" style="background-color:#3673aa;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:0px 0px;line-height:100%;max-width:100%"><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%;mso-text-raise:0" hidden>&nbsp;</i><![endif]--></span><span style="background-color:#3673aa;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:14px 7px;max-width:100%;line-height:120%;text-transform:none;mso-padding-alt:0px;mso-text-raise:0">Join Coaster</span><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">If you don&#x27;t want to create an account, just ignore and delete this message.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </table>
		<div style="width:100%; text-align:center; color:#404040; margin-top:12px">Coaster, 2261 Market Street STE 5450, San Francisco, CA 94114</div>
  </body>

</html>
`

var SEND_INVITE_PLAIN_TEMPLATE = template.Must(template.New("send_invite_plain").Parse(SEND_INVITE_PLAIN_TEMPLATE_STRING))

const SEND_INVITE_PLAIN_TEMPLATE_STRING = `
	Hi there!

	{{.SenderName}} is inviting you to join Coaster, the best way to plan adventure travel. You can create an account here: {{.Domain}}/signup?email={{.Email}}&destination=profile
	
	If you don't want to create an account, just ignore and delete this message.

	Coaster, 2261 Market Street STE 5450, San Francisco, CA 94114
`

var SEND_CREATE_PASSWORD_TEMPLATE = template.Must(template.New("send_create_password").Parse(SEND_CREATE_PASSWORD_TEMPLATE_STRING))

const SEND_CREATE_PASSWORD_TEMPLATE_STRING = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
<html lang="en">

  <head></head>
  <div id="email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
		Coaster create password
  </div>

  <body style="background-color:#f6f9fc;padding:10px 0">
    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
      <tr style="width:100%">
        <td><img alt="Coaster" src="https://www.trycoaster.com/long-logo.png" height="40" style="display:block;outline:none;border:none;text-decoration:none" />
          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <td>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Hi {{.FirstName}},</p>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">{{.SenderName}} is inviting you to join Coaster. You can setup your account here:</p><a href="{{.Domain}}/create-password?token={{.Token}}&destination=profile" target="_blank" style="background-color:#3673aa;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:0px 0px;line-height:100%;max-width:100%"><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%;mso-text-raise:0" hidden>&nbsp;</i><![endif]--></span><span style="background-color:#3673aa;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:14px 7px;max-width:100%;line-height:120%;text-transform:none;mso-padding-alt:0px;mso-text-raise:0">Join Coaster</span><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">If you weren&#x27;t expecting this email, just ignore and delete this message.</p>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">To keep your account secure, please don&#x27;t forward this email to anyone.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </table>
		<div style="width:100%; text-align:center; color:#404040; margin-top:12px">Coaster, 2261 Market Street STE 5450, San Francisco, CA 94114</div>
  </body>

</html>
`

var SEND_CREATE_PASSWORD_PLAIN_TEMPLATE = template.Must(template.New("send_create_password_plain").Parse(SEND_CREATE_PASSWORD_PLAIN_TEMPLATE_STRING))

const SEND_CREATE_PASSWORD_PLAIN_TEMPLATE_STRING = `
	Hi {{.FirstName}},

	{{.SenderName}} is inviting you to join Coaster. You can setup your account here: {{.Domain}}/create-password?token={{.Token}}&destination=profile
	
	If you weren't expecting this email, just ignore and delete this message.
	To keep your account secure, please don't forward this email to anyone.

	Coaster, 2261 Market Street STE 5450, San Francisco, CA 94114
`
