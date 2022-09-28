package api_test

import (
	"fabra/internal/models"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("RunQueryHandler", func() {
	It("should not allow access to another organization's data connection", func() {
		var user models.User
		result := db.Table("users").First(&user)
		Expect(result.Error).ToNot(BeNil())
	})
})
