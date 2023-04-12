package connectors_test

import (
	"context"
	"time"

	"github.com/golang/mock/gomock"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/test"
	"go.fabra.io/server/common/views"
	"go.fabra.io/sync/connectors"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Router", func() {
	var (
		sourceConnection views.FullConnection
		sync             views.Sync
		fieldMappings    []views.FieldMapping
	)

	BeforeEach(func() {
	})

	/*
		TODO

		Read
		1. Cursor position calculated correctly

		Write
		1. Unused object fields interspersed
		2. Out of order object fields
		3. Various types mapped correctly to the bigquery expected format
		4. Mapping multiple JSON fields to a single object
		5. Test schema using gomock

	*/

	It("reads correctly", func() {
		ctrl := gomock.NewController(GinkgoT())
		queryService := test.NewMockQueryService(db, ctrl)
		defer ctrl.Finish()

		connector := connectors.NewBigQueryConnector(queryService)
		rowsC := make(chan []data.Row)
		readOutputC := make(chan connectors.ReadOutput)
		errC := make(chan error)

		connector.Read(context.TODO(), sourceConnection, sync, fieldMappings, rowsC, readOutputC, errC)
		readOutput, rows, err := waitForRead(rowsC, readOutputC, errC)

		currentTime := time.Now()
		object := map[string]int{
			"a": 1,
			"b": 2,
		}

		// TODO: make expected data
		outputData := []data.Row{
			{"1", 1, currentTime, object},
		}

		// TODO: make sure this is correct
		Expect(err).To(BeNil())
		Expect(readOutput.CursorPosition).To(Equal(nil))
		Expect(rows).To(Equal(outputData))
	})
})

func waitForRead(
	rowsC <-chan []data.Row,
	readOutputC <-chan connectors.ReadOutput,
	errC <-chan error,
) (*connectors.ReadOutput, []data.Row, error) {
	var readOutput connectors.ReadOutput
	var rows []data.Row
	var readDone bool
	for {
		if readDone {
			break
		}

		// wait for both error channels in any order, immediately exiting if an error is returned
		select {
		case err := <-errC:
			if err != nil {
				return nil, nil, err
			}
		case rowBatch := <-rowsC:
			rows = append(rows, rowBatch...)
		case readOutput = <-readOutputC:
			readDone = true
		}
	}

	return &readOutput, rows, nil
}
