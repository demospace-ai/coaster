package sessions

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fabra/internal/models"
	"fmt"
	"time"

	"gorm.io/gorm"
)

const TOKEN_BITS = 256
const DAY = time.Duration(24) * time.Hour
const SESSION_EXPIRATION = time.Duration(14) * DAY

func generateToken() (*string, error) {
	b := make([]byte, TOKEN_BITS/8)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}

	token := fmt.Sprintf("%x", b)
	return &token, nil
}

// Exported for testing
func HashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return base64.StdEncoding.EncodeToString(h[:])
}

func Create(db *gorm.DB, userID int64) (*string, error) {
	rawToken, err := generateToken()
	if err != nil {
		return nil, err
	}

	// we store hashed tokens in case the DB is leaked
	token := HashToken(*rawToken)
	expiration := time.Now().Add(SESSION_EXPIRATION)

	session := models.Session{
		Token:      token,
		UserID:     userID,
		Expiration: expiration,
	}

	result := db.Create(&session)
	if result.Error != nil {
		return nil, result.Error
	}

	return rawToken, nil
}

func Refresh(db *gorm.DB, session *models.Session) (*models.Session, error) {
	expiration := time.Now().Add(SESSION_EXPIRATION)
	result := db.Model(session).Update("expiration", expiration)
	if result.Error != nil {
		return nil, result.Error
	}

	return session, nil
}

func Clear(db *gorm.DB, session *models.Session) error {
	currentTime := time.Now()
	result := db.Model(session).Update("deactivated_at", currentTime)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

func LoadValidByToken(db *gorm.DB, rawToken string) (*models.Session, error) {
	// we store hashed tokens in case the DB is leaked
	token := HashToken(rawToken)

	var session models.Session
	result := db.Take(&session, "token = ? AND expiration >= ? AND deactivated_at IS NULL", token, time.Now())
	if result.Error != nil {
		return nil, result.Error
	}

	return &session, nil
}
