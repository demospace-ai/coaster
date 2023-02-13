package api_test

import (
	"testing"

	"go.fabra.io/server/common/test"
	"go.fabra.io/server/internal/api"

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
	service = api.NewApiService(db, test.MockAuthService{}, test.MockCryptoService{}, test.NewMockQueryService(db))
})

var _ = AfterSuite((func() {
	cleanup()
}))
