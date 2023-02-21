package main

import (
	"log"

	"go.fabra.io/sync/temporal"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func main() {
	// Create the client object just once per process
	c, err := client.Dial(client.Options{
		HostPort: temporal.HostPort,
	})
	if err != nil {
		log.Fatalln("unable to create Temporal client", err)
	}
	defer c.Close()

	// This worker hosts both Workflow and Activity functions
	w := worker.New(c, temporal.SyncTaskQueue, worker.Options{})
	w.RegisterActivity(temporal.FetchConfiguration)
	w.RegisterActivity(temporal.Replicate)
	w.RegisterWorkflow(temporal.SyncWorkflow)

	// Start listening to the Task Queue
	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("unable to start Worker", err)
	}
}
