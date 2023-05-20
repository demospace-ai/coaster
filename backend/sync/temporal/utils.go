package temporal

import (
	"context"
	"crypto/tls"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/secret"
	"go.temporal.io/sdk/client"
)

func getTemporalHostPort() string {
	if application.IsProd() {
		return "fabra.rhbmi.tmprl.cloud:7233"
	} else {
		return "localhost:7233"
	}
}

func getTemporalNamespace() string {
	if application.IsProd() {
		return "fabra.rhbmi"
	} else {
		return "default"
	}
}

func CreateClient(certPem string, certKey string) (client.Client, error) {
	clientPem, err := secret.FetchSecret(context.TODO(), certPem)
	if err != nil {
		return nil, err
	}

	clientKey, err := secret.FetchSecret(context.TODO(), certKey)
	if err != nil {
		return nil, err
	}

	cert, err := tls.X509KeyPair([]byte(*clientPem), []byte(*clientKey))
	if err != nil {
		return nil, err
	}

	// Create the client object just once per process
	var connectionOptions client.ConnectionOptions
	if application.IsProd() {
		connectionOptions = client.ConnectionOptions{
			TLS: &tls.Config{
				Certificates: []tls.Certificate{cert},
			},
		}
	} else {
		connectionOptions = client.ConnectionOptions{}
	}
	return client.Dial(client.Options{
		HostPort:          getTemporalHostPort(),
		Namespace:         getTemporalNamespace(),
		ConnectionOptions: connectionOptions,
	})
}
