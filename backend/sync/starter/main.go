package main

import (
	"context"
	"log"

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

	// s := c.ScheduleClient()
	// id := uuid.New()
	// var input []any
	// input = append(input, temporal.SyncInput{
	// 	SyncID: 9, OrganizationID: 1,
	// })
	// s.Create(context.TODO(), client.ScheduleOptions{
	// 	ID: id.String(),
	// 	Action: &client.ScheduleWorkflowAction{
	// 		TaskQueue: temporal.SyncTaskQueue,
	// 		Workflow:  temporal.SyncWorkflow,
	// 		Args:      input,
	// 	},
	// 	Spec: client.ScheduleSpec{
	// 		Intervals: []client.ScheduleIntervalSpec{
	// 			{
	// 				Every: time.Hour,
	// 			},
	// 		},
	// 	},
	// })

	c.ExecuteWorkflow(context.TODO(), client.StartWorkflowOptions{
		TaskQueue: temporal.SyncTaskQueue,
	}, temporal.SyncWorkflow, temporal.SyncInput{SyncID: 10, OrganizationID: 1})
}
