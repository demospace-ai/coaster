package api

import (
	"encoding/json"
	"fabra/internal/models"

	"github.com/fabra-io/go-sdk/fabra"
)

func (s ApiService) NewBigQueryClient(dataConnection models.DataConnection) (fabra.ApiClient, error) {
	bigQueryCredentialsString, err := s.cryptoService.DecryptDataConnectionCredentials(dataConnection.Credentials.String)
	if err != nil {
		return nil, err
	}

	var bigQueryCredentials models.BigQueryCredentials
	err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
	if err != nil {
		return nil, err
	}

	return fabra.NewAPIClient(
		fabra.WarehouseType(dataConnection.ConnectionType),
		map[string]interface{}{
			fabra.GCPProjectID:   &bigQueryCredentials.ProjectID,
			fabra.GCPCredentials: bigQueryCredentialsString,
		},
	)
}
