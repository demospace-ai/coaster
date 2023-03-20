package views

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/models"
)

const CUSTOMER_VISIBLE_TIME_FORMAT = "01/02/06 at 03:04 PM MST"

type Sync struct {
	ID                int64                 `json:"id"`
	OrganizationID    int64                 `json:"organization_id"`
	EndCustomerID     int64                 `json:"end_customer_id"`
	DisplayName       string                `json:"display_name"`
	SourceID          int64                 `json:"source_id"`
	ObjectID          int64                 `json:"object_id"`
	Namespace         *string               `json:"namespace,omitempty"`
	TableName         *string               `json:"table_name,omitempty"`
	CustomJoin        *string               `json:"custom_join,omitempty"`
	CursorPosition    *string               `json:"cursor_position,omitempty"`
	SourceCursorField *string               `json:"source_cursor_field,omitempty"`
	SourcePrimaryKey  *string               `json:"source_primary_key,omitempty"`
	SyncMode          models.SyncMode       `json:"sync_mode"`
	Frequency         int64                 `json:"frequency"`
	FrequencyUnits    models.FrequencyUnits `json:"frequency_units"`
}

type SyncRun struct {
	Status      models.SyncRunStatus `json:"status"`
	StartedAt   string               `json:"started_at"`
	CompletedAt string               `json:"completed_at"`
	Duration    string               `json:"duration"`
	Error       *string              `json:"error,omitempty"`
	RowsWritten int                  `json:"rows_written"`
}

type FieldMapping struct {
	SourceFieldName    string         `json:"source_field_name"`
	SourceFieldType    data.FieldType `json:"source_field_type"`
	DestinationFieldId int64          `json:"destination_field_id"`
}

func ConvertSync(sync *models.Sync) Sync {
	syncView := Sync{
		ID:             sync.ID,
		OrganizationID: sync.OrganizationID,
		EndCustomerID:  sync.EndCustomerID,
		DisplayName:    sync.DisplayName,
		SourceID:       sync.SourceID,
		ObjectID:       sync.ObjectID,
		SyncMode:       sync.SyncMode,
		Frequency:      sync.Frequency,
	}

	if sync.Namespace.Valid {
		syncView.Namespace = &sync.Namespace.String
	}
	if sync.TableName.Valid {
		syncView.TableName = &sync.TableName.String
	}
	if sync.CustomJoin.Valid {
		syncView.CustomJoin = &sync.CustomJoin.String
	}
	if sync.CursorPosition.Valid {
		syncView.CursorPosition = &sync.CursorPosition.String
	}
	if sync.SourceCursorField.Valid {
		syncView.SourceCursorField = &sync.SourceCursorField.String
	}
	if sync.SourcePrimaryKey.Valid {
		syncView.SourcePrimaryKey = &sync.SourcePrimaryKey.String
	}

	return syncView
}

func ConvertFieldMappings(fieldMappings []models.FieldMapping) []FieldMapping {
	var fieldMappingsView []FieldMapping
	for _, fieldMapping := range fieldMappings {
		fieldMappingsView = append(fieldMappingsView, FieldMapping{
			SourceFieldName:    fieldMapping.SourceFieldName,
			SourceFieldType:    fieldMapping.SourceFieldType,
			DestinationFieldId: fieldMapping.DestinationFieldId,
		})
	}

	return fieldMappingsView
}

func ConvertSyncRuns(syncRuns []models.SyncRun, timezone *time.Location) ([]SyncRun, error) {
	var syncRunsView []SyncRun
	for _, syncRun := range syncRuns {
		duration, err := getDurationString(syncRun.CompletedAt.Sub(syncRun.StartedAt))
		if err != nil {
			return nil, err
		}
		syncRunView := SyncRun{
			Status:      syncRun.Status,
			StartedAt:   syncRun.StartedAt.In(timezone).Format(CUSTOMER_VISIBLE_TIME_FORMAT),
			CompletedAt: syncRun.CompletedAt.In(timezone).Format(CUSTOMER_VISIBLE_TIME_FORMAT),
			Duration:    *duration,
			RowsWritten: syncRun.RowsWritten,
		}
		if syncRun.Error.Valid {
			syncRunView.Error = &syncRun.Error.String
		}

		syncRunsView = append(syncRunsView, syncRunView)
	}

	return syncRunsView, nil
}

func getDurationString(duration time.Duration) (*string, error) {
	var output []string
	remaining := duration.Truncate(time.Second).String()

	hSplit := strings.Split(remaining, "h")
	if len(hSplit) == 1 {
		remaining = hSplit[0]
	} else {
		hours, err := strconv.Atoi(hSplit[0])
		if err != nil {
			return nil, err
		}

		if hours == 1 {
			output = append(output, fmt.Sprintf("%d hour", hours))
		} else if hours > 0 {
			output = append(output, fmt.Sprintf("%d hours", hours))
		}
		remaining = hSplit[1]
	}

	mSplit := strings.Split(remaining, "m")
	if len(mSplit) == 1 {
		remaining = mSplit[0]
	} else {
		minutes, err := strconv.Atoi(mSplit[0])
		if err != nil {
			return nil, err
		}

		if minutes == 1 {
			output = append(output, fmt.Sprintf("%d minute", minutes))
		} else if minutes > 0 {
			output = append(output, fmt.Sprintf("%d minutes", minutes))
		}
		remaining = mSplit[1]
	}

	sSplit := strings.Split(remaining, "s")
	if len(sSplit) == 1 {
	} else {
		seconds, err := strconv.Atoi(sSplit[0])
		if err != nil {
			return nil, err
		}

		if seconds == 1 {
			output = append(output, fmt.Sprintf("%d second", seconds))
		} else if seconds > 0 {
			output = append(output, fmt.Sprintf("%d seconds", seconds))
		}
	}

	outputStr := strings.Join(output, " ")
	if outputStr == "" {
		outputStr = "1 second"
	}

	return &outputStr, nil
}
