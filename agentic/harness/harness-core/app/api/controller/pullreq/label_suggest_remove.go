// Copyright 2023 Harness, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package pullreq

import (
	"context"
	"errors"
	"fmt"

	"github.com/harness/gitness/app/api/usererror"
	"github.com/harness/gitness/app/auth"
	"github.com/harness/gitness/store"
	"github.com/harness/gitness/types/enum"
)

// RemoveSuggestedLabel removes a pending label suggestion from a pull request.
func (c *Controller) RemoveSuggestedLabel(
	ctx context.Context,
	session *auth.Session,
	repoRef string,
	pullreqNum int64,
	labelID int64,
) error {
	repo, err := c.getRepoCheckAccess(ctx, session, repoRef, enum.PermissionRepoReview)
	if err != nil {
		return fmt.Errorf("failed to acquire access to target repo: %w", err)
	}

	pullreq, err := c.pullreqStore.FindByNumber(ctx, repo.ID, pullreqNum)
	if err != nil {
		return fmt.Errorf("failed to find pullreq: %w", err)
	}

	err = c.labelSuggestionStore.Delete(ctx, pullreq.ID, labelID)
	if errors.Is(err, store.ErrResourceNotFound) {
		return usererror.NotFoundf("Suggested label with ID %d could not be found.", labelID)
	}
	if err != nil {
		return fmt.Errorf("failed to delete label suggestion: %w", err)
	}

	return nil
}
