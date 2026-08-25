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
	"fmt"

	"github.com/harness/gitness/app/auth"
	"github.com/harness/gitness/app/services/label"
	"github.com/harness/gitness/types/enum"
)

// SuggestLabels suggests labels for a pull request.
func (c *Controller) SuggestLabels(
	ctx context.Context,
	session *auth.Session,
	repoRef string,
	pullreqNum int64,
	in label.CreatePullReqLabelSuggestionsRequest,
) error {
	// Validate all inputs: individual fields and batch constraints (no duplicates)
	if err := in.Validate(); err != nil {
		return fmt.Errorf("failed to validate suggestions: %w", err)
	}

	repo, err := c.getRepoCheckAccess(ctx, session, repoRef, enum.PermissionRepoReview)
	if err != nil {
		return fmt.Errorf("failed to acquire access to target repo: %w", err)
	}

	pullreq, err := c.pullreqStore.FindByNumber(ctx, repo.ID, pullreqNum)
	if err != nil {
		return fmt.Errorf("failed to find pullreq: %w", err)
	}

	// Create and validate suggestions in the service
	if err = c.labelSvc.CreateSuggestions(
		ctx, repo.ParentID, repo.ID, session.Principal.ID, pullreq.ID, in.Labels,
	); err != nil {
		return fmt.Errorf("failed to create label suggestions: %w", err)
	}

	return nil
}
