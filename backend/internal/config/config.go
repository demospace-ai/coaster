package config

import (
	"context"
	"fmt"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	secretmanagerpb "google.golang.org/genproto/googleapis/cloud/secretmanager/v1"

	"github.com/spf13/viper"
)

// TODO: move this configuration to YAML or something
type secretConfigType struct {
	secretKey string
	configKey string
}

var databasePassword = secretConfigType{
	secretKey: "",
	configKey: "database-password",
}

func InitConfig() error {
	if err := addSecretToConfig(databasePassword); err != nil {
		return err
	}

	if err := addSecretToConfig(mailgunApiKey); err != nil {
		return err
	}

	return nil
}

func GetDbPassword() string {
	return viper.GetString(databasePassword.configKey)
}
