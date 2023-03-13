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
	}, temporal.SyncWorkflow, temporal.SyncInput{SyncID: 1, OrganizationID: 2})

	_, err = c.SignalWithStartWorkflow(context.TODO(), "6d15a0a5-6df8-45ac-881e-ec8828d45d7c", "start", nil, client.StartWorkflowOptions{
		TaskQueue: temporal.SyncTaskQueue,
	}, temporal.SyncWorkflow, temporal.SyncInput{SyncID: 11, OrganizationID: 1})
	if err != nil {
		log.Fatal(err)
	}

	// ctx := context.TODO()
	// res, err := c.ListWorkflow(ctx, &workflowservice.ListWorkflowExecutionsRequest{
	// 	Query: fmt.Sprintf("WorkflowId = '%s'", "6d15a0a5-6df8-45ac-881e-ec8828d45d7c"),
	// })
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// for _, execution := range res.Executions {
	// 	if execution.Status != enums.WORKFLOW_EXECUTION_STATUS_RUNNING {
	// 		h := c.GetWorkflowHistory(ctx, execution.Execution.WorkflowId, execution.Execution.RunId, false, enums.HISTORY_EVENT_FILTER_TYPE_CLOSE_EVENT)
	// 		event, err := h.Next()
	// 		if err != nil {
	// 			log.Printf("err: %+v", err.Error())
	// 		}

	// 		attributes := event.GetWorkflowExecutionContinuedAsNewEventAttributes()
	// 		if attributes.GetFailure().GetApplicationFailureInfo().GetType() == "CustomerVisibleError" {
	// 			fmt.Printf("%v\n", attributes.GetFailure().GetCause().GetMessage())
	// 		} else {
	// 			fmt.Printf("unknown error: %v\n", attributes.GetFailure())
	// 		}
	// 	}
	// }
}
