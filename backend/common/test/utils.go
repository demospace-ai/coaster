package test

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"go.coaster.io/server/common/application"
	"go.coaster.io/server/common/models"

	"github.com/golang-migrate/migrate"
	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	_ "github.com/golang-migrate/migrate/database/postgres"
	_ "github.com/golang-migrate/migrate/source/file"
)

func SetupDatabase() (*gorm.DB, func()) {
	pool, err := dockertest.NewPool("")
	if err != nil {
		log.Fatalf("Could not connect to docker: %v", err)
	}

	// pulls an image, creates a container based on it and runs it
	resource, err := pool.RunWithOptions(&dockertest.RunOptions{
		Repository: "postgis/postgis",
		Tag:        "15-master",
		Env: []string{
			"POSTGRES_PASSWORD=coastertest",
			"POSTGRES_USER=coastertest",
			"POSTGRES_DB=coastertest",
			"listen_addresses='*'",
		},
	}, func(config *docker.HostConfig) {
		// set AutoRemove to true so that stopped container goes away by itself
		config.AutoRemove = true
		config.RestartPolicy = docker.RestartPolicy{Name: "no"}
		if application.IsCloudBuild() {
			config.NetworkMode = "cloudbuild"
		}
	})
	if err != nil {
		log.Fatalf("Could not start resource: %v", err)
	}

	var host, port string
	if application.IsCloudBuild() {
		host = resource.Container.NetworkSettings.Networks["cloudbuild"].IPAddress
		port = "5432"
	} else {
		host = "localhost"
		port = resource.GetPort("5432/tcp")
	}

	dbURI := fmt.Sprintf("user=coastertest password=coastertest database=coastertest host=%s port=%s", host, port)

	log.Println("Connecting to database with uri:", dbURI)

	resource.Expire(120) // Tell docker to hard kill the container in 120 seconds

	// exponential backoff-retry, because the application in the container might not be ready to accept connections yet
	var db *gorm.DB
	pool.MaxWait = 120 * time.Second
	if err = pool.Retry(func() error {
		db, err = gorm.Open(postgres.Open(dbURI), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		return err
	}); err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	log.Println("Running migrations.")
	migrateURI := fmt.Sprintf("postgres://coastertest:coastertest@%s:%s/coastertest?sslmode=disable", host, port)

	wd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Could not get working directory: %v", err)
	}

	var migrationsDir string
	if strings.Contains(wd, "/sync/") {
		migrationsDir = "file://../../server/migrations"
	} else {
		migrationsDir = "file://../../migrations"
	}

	m, err := migrate.New(migrationsDir, migrateURI)
	if err != nil {
		log.Fatalf("Unable to open migrations connection: %s, %v", migrateURI, err)
	}

	err = m.Up()
	if err != nil {
		log.Fatalf("Unable to run migrations: %v", err)
	}

	cleanup := func() {
		// You can't defer this because os.Exit doesn't care for defer
		if err := pool.Purge(resource); err != nil {
			log.Fatalf("Could not purge resource: %v", err)
		}
	}

	return db, cleanup
}

func GetCloudbuildNetwork(pool *dockertest.Pool) *docker.Network {
	networks, err := pool.Client.ListNetworks()
	if err != nil {
		log.Fatalf("Could not fetch networks")
	}

	for _, network := range networks {
		if network.Name == "cloudbuild" {
			return &network
		}
	}

	log.Fatalf("No cloudbuild network found")
	return nil
}

func SeedDatabase(db *gorm.DB) error {
	user := models.User{}
	db.Create(&user)

	return nil
}
