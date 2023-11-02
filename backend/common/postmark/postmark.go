package postmark

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"go.fabra.io/server/common/errors"
)

const POSTMARK_URL = "https://api.postmarkapp.com"

type Client struct {
	// HTTPClient is &http.Client{} by default
	HTTPClient *http.Client
	// Server Token: Used for requests that require server level privileges. This token can be found on the Credentials tab under your Postmark server.
	ServerToken string
	// BaseURL is the root API endpoint
	BaseURL string
}

// Email is exactly what it sounds like
type Email struct {
	// From: REQUIRED The sender email address. Must have a registered and confirmed Sender Signature.
	From string `json:",omitempty"`
	// To: REQUIRED Recipient email address. Multiple addresses are comma separated. Max 50.
	To string `json:",omitempty"`
	// Cc recipient email address. Multiple addresses are comma separated. Max 50.
	Cc string `json:",omitempty"`
	// Bcc recipient email address. Multiple addresses are comma separated. Max 50.
	Bcc string `json:",omitempty"`
	// Subject: Email subject
	Subject string `json:",omitempty"`
	// HtmlBody: HTML email message. REQUIRED, If no TextBody specified
	HtmlBody string `json:",omitempty"`
	// TextBody: Plain text email message. REQUIRED, If no HtmlBody specified
	TextBody string `json:",omitempty"`
}

type EmailResponse struct {
	// To: Recipient email address
	To string
	// SubmittedAt: Timestamp
	SubmittedAt time.Time
	// MessageID: ID of message
	MessageID string
	// ErrorCode: API Error Codes
	ErrorCode int64
	// Message: Response message
	Message string
}

type parameters struct {
	// Method is HTTP method type.
	Method string
	// Path is postfix for URI.
	Path string
	// Payload for the request.
	Payload interface{}
}

func NewClient(serverToken string) *Client {
	return &Client{
		HTTPClient:  &http.Client{},
		ServerToken: serverToken,
		BaseURL:     POSTMARK_URL,
	}
}

func (client *Client) doRequest(opts parameters, dst interface{}) error {
	url := fmt.Sprintf("%s/%s", client.BaseURL, opts.Path)

	req, err := http.NewRequest(opts.Method, url, nil)
	if err != nil {
		return err
	}

	if opts.Payload != nil {
		payloadData, err := json.Marshal(opts.Payload)
		if err != nil {
			return err
		}
		req.Body = io.NopCloser(bytes.NewBuffer(payloadData))
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("X-Postmark-Server-Token", client.ServerToken)

	res, err := client.HTTPClient.Do(req)
	if err != nil {
		return err
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	err = json.Unmarshal(body, dst)
	return err
}

// APIError represents errors returned by Postmark
type APIError struct {
	// ErrorCode: see error codes here: https://postmarkapp.com/developer/api/overview#error-codes
	ErrorCode int64
	// Message contains error details
	Message string
}

// Error returns the error message details
func (res APIError) Error() string {
	return res.Message
}

func (client *Client) SendEmail(email Email) (EmailResponse, error) {
	res := EmailResponse{}
	err := client.doRequest(parameters{
		Method:  "POST",
		Path:    "email",
		Payload: email,
	}, &res)

	if res.ErrorCode != 0 {
		return res, errors.Newf("%v %s", res.ErrorCode, res.Message)
	}

	return res, err
}
