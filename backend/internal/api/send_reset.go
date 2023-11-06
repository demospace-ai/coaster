package api

import (
	"bytes"
	"encoding/json"
	"html/template"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/emails"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/reset_tokens"
	"go.fabra.io/server/common/repositories/users"
)

type SendResetRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetTemplateArgs struct {
	FirstName string
	Token     string
	Domain    string
}

func (s ApiService) SendReset(w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var sendResetRequest SendResetRequest
	err := decoder.Decode(&sendResetRequest)
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(sendResetRequest)
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) validating request")
	}

	user, err := users.LoadByEmail(s.db, sendResetRequest.Email)
	if err != nil {
		// TODO: return something more informative here
		return errors.Wrap(err, "(api.SendReset) no user for this email")
	}

	// TODO: rate limit emails
	token, err := reset_tokens.GetActiveResetToken(s.db, user)
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) creating reset token")
	}

	var domain string
	if application.IsProd() {
		domain = "https://trycoaster.com"
	} else {
		domain = "http://localhost:3000"
	}

	var html bytes.Buffer
	SEND_RESET_TEMPLATE.Execute(&html, ResetTemplateArgs{
		FirstName: user.FirstName,
		Token:     token.Token,
		Domain:    domain,
	})

	var plain bytes.Buffer
	SEND_RESET_PLAIN_TEMPLATE.Execute(&plain, ResetTemplateArgs{
		FirstName: user.FirstName,
		Token:     token.Token,
		Domain:    domain,
	})

	err = emails.SendEmail("support@trycoaster.com", sendResetRequest.Email, "Reset your password", html.String(), plain.String())
	if err != nil {
		return errors.Wrap(err, "(api.SendReset) sending email")
	}

	return nil
}

var SEND_RESET_TEMPLATE = template.Must(template.New("send_reset").Parse(SEND_RESET_TEMPLATE_STRING))

const SEND_RESET_TEMPLATE_STRING = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
<html lang="en">

  <head></head>
  <div id="email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
		Coaster reset your password
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
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Someone recently requested a password change for your Coaster account. If this was you, you can set a new password here:</p><a href="{{.Domain}}/reset-password?token={{.Token}}" target="_blank" style="background-color:#3673aa;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:0px 0px;line-height:100%;max-width:100%"><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%;mso-text-raise:0" hidden>&nbsp;</i><![endif]--></span><span style="background-color:#3673aa;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-decoration:none;text-align:center;display:inline-block;width:210px;padding:14px 7px;max-width:100%;line-height:120%;text-transform:none;mso-padding-alt:0px;mso-text-raise:0">Reset password</span><span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">If you don&#x27;t want to change your password or didn&#x27;t request this, just ignore and delete this message.</p>
                  <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">To keep your account secure, please don&#x27;t forward this email to anyone.</p>
                </td>
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

var SEND_RESET_PLAIN_TEMPLATE = template.Must(template.New("send_reset_plain").Parse(SEND_RESET_PLAIN_TEMPLATE_STRING))

const SEND_RESET_PLAIN_TEMPLATE_STRING = `
	Hi {{.FirstName}},

	Someone recently requested a password change for your Coaster account. If this was you, you can set a new password here: {{.Domain}}/reset-password?token={{.Token}}
	
	If you don't want to change your password or didn't request this, just ignore and delete this message.
	To keep your account secure, please don't forward this email to anyone.

	Coaster, 2261 Market Street STE 5450, San Francisco, CA 94114
`
