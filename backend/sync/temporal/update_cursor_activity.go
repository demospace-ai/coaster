package temporal

import (
	"context"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/server/common/views"
)

type UpdateCursorInput struct {
	Sync           views.Sync
	CursorPosition string
}

func UpdateCursor(ctx context.Context, input UpdateCursorInput) error {
	db, err := database.InitDatabase()
	if err != nil {
		return err
	}

	sync, err := syncs.LoadSyncByID(db, input.Sync.OrganizationID, input.Sync.ID)
	if err != nil {
		return err
	}

	_, err = syncs.UpdateCursor(db, sync, input.CursorPosition)
	return err
}
