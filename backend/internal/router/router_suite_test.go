package router_test

import (
	"fabra/internal/router"
	"fabra/internal/test"
	"testing"

	"gorm.io/gorm"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var db *gorm.DB
var r router.Router
var cleanup func()

func TestRouter(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Router Suite")
}

var _ = BeforeSuite(func() {
	db, cleanup = test.SetupDatabase()
	r = router.NewRouter(db)
})

var _ = AfterSuite((func() {
	cleanup()
}))
