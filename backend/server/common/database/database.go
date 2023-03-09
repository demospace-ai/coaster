package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

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

var EmptyNullInt64 = NullInt64{sql.NullInt64{Valid: false}}

func InitDatabase() (*gorm.DB, error) {
	if application.IsProd() {
		return initDatabaseProd()
	} else {
		return initDatabaseDev()
	}
}

func initDatabaseDev() (*gorm.DB, error) {
	dbURI := "user=fabra password=fabra database=fabra host=localhost"

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
		return nil, fmt.Errorf("sql.Open: %v", err)
	}

	return db, nil
}

func initDatabaseProd() (*gorm.DB, error) {
	var (
		dbUser    = mustGetenv("DB_USER")
		dbPwd     = config.GetDbPassword()
		dbTCPHost = mustGetenv("DB_HOST")
		dbPort    = mustGetenv("DB_PORT")
		dbName    = mustGetenv("DB_NAME")
	)

	dbURI := fmt.Sprintf("host=%s user=%s password=%s port=%s database=%s", dbTCPHost, dbUser, dbPwd, dbPort, dbName)

	db, err := gorm.Open(postgres.Open(dbURI), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %v", err)
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
