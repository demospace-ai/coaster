package config

import (
	"context"

	"github.com/spf13/viper"
	"go.fabra.io/server/common/secret"
)

// TODO: move this configuration to YAML or something
type secretConfigType struct {
	secretKey string
	configKey string
}

var databasePassword = secretConfigType{
	secretKey: "projects/932264813910/secrets/fabra-db-password/versions/latest",
	configKey: "database-password",
}

func InitConfig() error {
	if err := addSecretToConfig(databasePassword); err != nil {
		return err
	}

	return nil
}

func GetDbPassword() string {
	return viper.GetString(databasePassword.configKey)
}

func addSecretToConfig(secretConfig secretConfigType) error {
	secret, err := secret.FetchSecret(context.TODO(), secretConfig.secretKey)
	if err != nil {
		return err
	}

	viper.Set(secretConfig.configKey, secret)

	return nil
}
