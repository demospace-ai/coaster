package temporal

import (
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

func DoSync(ctx workflow.Context, syncParams SyncParams) error {
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
	var syncConfiguration SyncConfiguration
	err := workflow.ExecuteActivity(ctx, FetchConfiguration, syncParams.syncID).Get(ctx, &syncConfiguration)
	if err != nil {
		return err
	}
	err = workflow.ExecuteActivity(ctx, Sync, syncConfiguration).Get(ctx, nil)
	if err != nil {
		return err
	}
	return nil
}
