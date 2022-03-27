package application

import "os"

func IsProd() bool {
	_, isSet := os.LookupEnv("IS_PROD")
	return isSet
}
