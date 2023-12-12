package input

import "github.com/microcosm-cc/bluemonday"

var POLICY = bluemonday.UGCPolicy()

func Sanitize(s string) string {
	return POLICY.Sanitize(s)
}

func SanitizePtr(s *string) *string {
	if s == nil {
		return nil
	}

	sanitized := POLICY.Sanitize(*s)
	return &sanitized
}
