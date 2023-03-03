package temporal

import (
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

const SyncTaskQueue = "SYNC_TASK_QUEUE"

type SyncInput struct {
	OrganizationID int64
	SyncID         int64
}

func SyncWorkflow(ctx workflow.Context, input SyncInput) error {
	logger := workflow.GetLogger(ctx)

	// RetryPolicy specifies how to automatically handle retries if an Activity fails.
	retrypolicy := &temporal.RetryPolicy{
		InitialInterval:    time.Second,
		BackoffCoefficient: 2.0,
		MaximumInterval:    time.Minute,
		MaximumAttempts:    1,
	}
	options := workflow.ActivityOptions{
		// Timeout options specify when to automatically timeout Activity functions.
		StartToCloseTimeout: time.Minute,
		// Optionally provide a customized RetryPolicy.
		// Temporal retries failures by default, this is just an example.
		RetryPolicy: retrypolicy,
	}

	ctx = workflow.WithActivityOptions(ctx, options)
	replicateInput := ReplicateInput(input)
	err := workflow.ExecuteActivity(ctx, Replicate, replicateInput).Get(ctx, nil)
	if err != nil {
		return err
	}

	logger.Info("Workflow success")
	return nil
}
