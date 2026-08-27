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
	events "github.com/harness/gitness/app/events/pullreq"
	"github.com/harness/gitness/types"
	"github.com/harness/gitness/types/enum"
)

type ReviewerAddInput struct {
	ReviewerID int64 `json:"reviewer_id"`
}

// ReviewerAdd adds a new reviewer to the pull request.
func (c *Controller) ReviewerAdd(
	ctx context.Context,
	session *auth.Session,
	repoRef string,
	prNum int64,
	in *ReviewerAddInput,
) (*types.PullReqReviewer, error) {
	repo, err := c.getRepoCheckAccess(ctx, session, repoRef, enum.PermissionRepoReview)
	if err != nil {
		return nil, fmt.Errorf("failed to acquire access to repo: %w", err)
	}

	pr, err := c.pullreqStore.FindByNumber(ctx, repo.ID, prNum)
	if err != nil {
		return nil, fmt.Errorf("failed to find pull request by number: %w", err)
	}

	reviewer, added, err := c.pullreqService.AddReviewer(ctx, &session.Principal, repo, pr, in.ReviewerID)
	if err != nil {
		return nil, err
	}

	if !added {
		return reviewer, nil
	}

	c.reportReviewerAddition(ctx, session, pr, reviewer)

	c.sseStreamer.Publish(ctx, repo.ParentID, enum.SSETypePullReqReviewerAdded, pr)
	return reviewer, nil
}

func (c *Controller) reportReviewerAddition(
	ctx context.Context,
	session *auth.Session,
	pr *types.PullReq,
	reviewer *types.PullReqReviewer,
) {
	c.eventReporter.ReviewerAdded(ctx, &events.ReviewerAddedPayload{
		Base:       eventBase(pr, &session.Principal),
		ReviewerID: reviewer.PrincipalID,
	})
}
