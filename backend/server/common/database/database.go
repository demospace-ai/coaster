package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/secret"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const DB_PASSWORD_KEY = "projects/932264813910/secrets/fabra-db-password/versions/latest"

type NullString struct{ sql.NullString }

func (s NullString) MarshalJSON() ([]byte, error) {
	if s.Valid {
		return json.Marshal(s.String)
	}
	return []byte(`null`), nil
}

func NewNullString(s string) NullString {
	return NullString{sql.NullString{String: s, Valid: true}}
}

type NullInt64 struct{ sql.NullInt64 }

func (i NullInt64) MarshalJSON() ([]byte, error) {
	if i.Valid {
		return json.Marshal(i.Int64)
	}
	return []byte(`null`), nil
}

func NewNullInt64(i int64) NullInt64 {
	return NullInt64{sql.NullInt64{Int64: i, Valid: true}}
}

type NullTime struct{ sql.NullTime }

func (t NullTime) MarshalJSON() ([]byte, error) {
	if t.Valid {
		return json.Marshal(t.Time)
	}
	return []byte(`null`), nil
}

func NewNullTime(t time.Time) NullTime {
	return NullTime{sql.NullTime{Time: t, Valid: true}}
}

var EmptyNullInt64 = NullInt64{sql.NullInt64{Valid: false}}

func InitDatabase() (*gorm.DB, error) {
	if application.IsProd() {
		return initDatabaseProd()
	} else {
		return initDatabaseDev()
	}
}

func initDatabaseDev() (*gorm.DB, error) {
	dbURI := "user=fabra password=fabra database=fabra host=localhost sslmode=require"

	db, err := gorm.Open(postgres.Open(dbURI), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logger.Config{
				SlowThreshold:             200 * time.Millisecond,
				LogLevel:                  logger.Warn,
				IgnoreRecordNotFoundError: true,
				Colorful:                  true,
			},
		),
	})
	if err != nil {
		return nil, errors.Wrap(err, "sql.Open")
	}

	sqldb, err := db.DB()
	if err != nil {
		return nil, errors.Wrap(err, "error getting raw DB handle")
	}

	sqldb.SetMaxOpenConns(10)
	sqldb.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func initDatabaseProd() (*gorm.DB, error) {
	var (
		dbUser = mustGetenv("DB_USER")
		dbHost = mustGetenv("DB_HOST")
		dbPort = mustGetenv("DB_PORT")
		dbName = mustGetenv("DB_NAME")
	)

	dbPwd, err := secret.FetchSecret(context.TODO(), DB_PASSWORD_KEY)
	if err != nil {
		return nil, err
	}

	// TODO: use client certificates here and enforce SSL verify full on Cloud SQL
	dbURI := fmt.Sprintf("host=%s user=%s password=%s port=%s database=%s", dbHost, dbUser, *dbPwd, dbPort, dbName)

	db, err := gorm.Open(postgres.Open(dbURI), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, errors.Wrap(err, "sql.Open")
	}

	return db, nil
}

func mustGetenv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatalf("Error: %s environment variable not set.\n", k)
	}
	return v
}
