package temporal

import (
	"time"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/query"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

type SyncInput struct {
	OrganizationID int64
	SyncID         int64
}

func SyncWorkflow(ctx workflow.Context, input SyncInput) error {
	// RetryPolicy specifies how to automatically handle retries if an Activity fails.
	retrypolicy := &temporal.RetryPolicy{
		InitialInterval:    time.Second,
		BackoffCoefficient: 2.0,
		MaximumInterval:    time.Minute,
		MaximumAttempts:    500,
	}
	options := workflow.ActivityOptions{
		// Timeout options specify when to automatically timeout Activity functions.
		StartToCloseTimeout: time.Minute,
		// Optionally provide a customized RetryPolicy.
		// Temporal retries failures by default, this is just an example.
		RetryPolicy: retrypolicy,
	}

	ctx = workflow.WithActivityOptions(ctx, options)

	db, err := database.InitDatabase()
	if err != nil {
		return err
	}

	queryService := query.NewQueryService(db, crypto.NewCryptoService())

	fetchConfigurationInput := FetchConfigurationInput{
		db:             db,
		organizationID: input.OrganizationID,
		syncID:         input.SyncID,
	}
	var sync SyncDetails
	err = workflow.ExecuteActivity(ctx, FetchConfiguration, fetchConfigurationInput).Get(ctx, &sync)
	if err != nil {
		return err
	}

	replicateInput := ReplicateInput{
		sync:         sync,
		queryService: queryService,
	}
	err = workflow.ExecuteActivity(ctx, Replicate, replicateInput).Get(ctx, nil)
	if err != nil {
		return err
	}
	return nil
}
