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
	events "github.com/harness/gitness/app/events/pullreq"
	gitness_store "github.com/harness/gitness/store"
	"github.com/harness/gitness/types"
	"github.com/harness/gitness/types/enum"

	"github.com/rs/zerolog/log"
)

// ApplySuggestedLabel applies a pending suggested label to a pull request and removes the suggestion entry.
func (c *Controller) ApplySuggestedLabel(
	ctx context.Context,
	session *auth.Session,
	repoRef string,
	pullreqNum int64,
	labelID int64,
) (*types.PullReqLabel, error) {
	repo, err := c.getRepoCheckAccess(ctx, session, repoRef, enum.PermissionRepoReview)
	if err != nil {
		return nil, fmt.Errorf("failed to acquire access to target repo: %w", err)
	}

	pullreq, err := c.pullreqStore.FindByNumber(ctx, repo.ID, pullreqNum)
	if err != nil {
		return nil, fmt.Errorf("failed to find pullreq: %w", err)
	}

	out, err := c.labelSvc.ApplySuggestion(
		ctx, session.Principal.ID, pullreq.ID, repo.ID, repo.ParentID, labelID)
	if err != nil {
		if errors.Is(err, gitness_store.ErrResourceNotFound) {
			return nil, usererror.ErrNotFound
		}
		return nil, fmt.Errorf("failed to apply label suggestion: %w", err)
	}

	if out.ActivityType == enum.LabelActivityNoop {
		return out.PullReqLabel, nil
	}

	err = func() error {
		if pullreq, err = c.pullreqStore.UpdateActivitySeq(ctx, pullreq); err != nil {
			return fmt.Errorf("failed to update pull request activity sequence: %w", err)
		}

		payload := activityPayload(out)
		if _, err := c.activityStore.CreateWithPayload(
			ctx, pullreq, session.Principal.ID, payload, nil); err != nil {
			return err
		}

		return nil
	}()
	if err != nil {
		log.Ctx(ctx).Err(err).Msg("failed to write pull request activity after applying label suggestion")
	}

	var newValueID *int64
	if out.NewLabelValue != nil {
		newValueID = &out.NewLabelValue.ID
	}

	c.eventReporter.LabelAssigned(ctx, &events.LabelAssignedPayload{
		Base: events.Base{
			PullReqID:    pullreq.ID,
			SourceRepoID: pullreq.SourceRepoID,
			TargetRepoID: pullreq.TargetRepoID,
			PrincipalID:  session.Principal.ID,
			Number:       pullreq.Number,
		},
		LabelID: out.Label.ID,
		ValueID: newValueID,
	})

	return out.PullReqLabel, nil
}
