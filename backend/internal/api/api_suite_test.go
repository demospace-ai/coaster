package api_test

import (
	"testing"

	"go.coaster.io/server/common/test"
	"go.coaster.io/server/internal/api"

	"gorm.io/gorm"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var db *gorm.DB
var service api.ApiService
var cleanup func()

func TestHandlers(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Handlers Suite")
}

var _ = BeforeSuite(func() {
	db, cleanup = test.SetupDatabase()
	service = api.NewApiService(db, test.MockAuthService{})
})

var _ = AfterSuite((func() {
	cleanup()
}))
