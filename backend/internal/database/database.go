package database

import (
	"fmt"
	"log"
	"os"

	"fabra/internal/application"
	"fabra/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase() (*gorm.DB, error) {
	if application.IsProd() {
		return initDatabaseProd()
	} else {
		return initDatabaseDev()
	}
}

func initDatabaseDev() (*gorm.DB, error) {
	dbURI := "user=postgres database=feedback host=localhost"

	db, err := gorm.Open(postgres.Open(dbURI), &gorm.Config{})
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

    dbURI := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPwd, dbTCPHost, dbPort, dbName)

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
		log.Fatalf("Warning: %s environment variable not set.\n", k)
	}
	return v
}
