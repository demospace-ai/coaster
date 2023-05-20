package temporal

import (
	"context"
	"fmt"
)

func (a *Activities) Cleanup(ctx context.Context) error {
	fmt.Print("cleanup")
	return nil
}
