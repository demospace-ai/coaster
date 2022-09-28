package api_test

import (
	"fabra/internal/test"
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"gorm.io/gorm"
)

var db *gorm.DB
var cleanup func()

func TestHandlers(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Handlers Suite")
}

var _ = BeforeSuite(func() {
	db, cleanup = test.SetupDatabase()
})

var _ = AfterSuite((func() {
	cleanup()
}))
