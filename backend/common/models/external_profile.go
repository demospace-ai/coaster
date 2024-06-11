package models

import "go.coaster.io/server/common/oauth"

type ExternalProfile struct {
	ExternalID    string
	OauthProvider oauth.OauthProvider
	UserID        int64

	BaseModel
}
