package main

import (
	"context"
	"log"
	"time"

	"go.fabra.io/sync/temporal"
	"go.temporal.io/sdk/client"
)

const CLIENT_PEM_KEY = "projects/932264813910/secrets/temporal-client-pem/versions/latest"
const CLIENT_KEY_KEY = "projects/932264813910/secrets/temporal-client-key/versions/latest"

// Program to manually trigger a workflow
func main() {

	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		log.Fatalln("unable to create Temporal client", err)
	}
	defer c.Close()

	ctx := context.TODO()
	scheduleClient := c.ScheduleClient()

	_, err = scheduleClient.Create(ctx, client.ScheduleOptions{
		ID:                 "7b77da75-26a9-4ef8-979b-d58defad7883",
		TriggerImmediately: true,
		Action: &client.ScheduleWorkflowAction{
			TaskQueue: temporal.SyncTaskQueue,
			Workflow:  temporal.SyncWorkflow,
			Args: []interface{}{temporal.SyncInput{
				SyncID: 16, OrganizationID: 1,
			}},
		},
		Spec: client.ScheduleSpec{
			Intervals: []client.ScheduleIntervalSpec{
				{
					Every: time.Hour * 24 * 7,
				},
			},
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
