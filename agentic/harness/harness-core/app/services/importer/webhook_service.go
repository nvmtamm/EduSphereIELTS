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

package importer

import (
	"context"
	goerrors "errors"

	"github.com/harness/gitness/errors"
)

// Classification sentinels that WebhookService implementations wrap into
// returned errors so callers can tell a user/token problem apart from an
// infrastructure problem.
var (
	// ErrWebhookUpsertUserFault indicates the webhook upsert failed for a
	// reason the user can fix: bad connector, missing token permissions,
	// revoked/expired credentials, wrong repo URL, etc.
	ErrWebhookUpsertUserFault = goerrors.New("webhook upsert rejected (user or token issue)")

	// ErrWebhookUpsertInfra indicates a transient/infra failure in our stack
	// (ng-manager unreachable, 5xx, network error). Retrying may work.
	ErrWebhookUpsertInfra = goerrors.New("webhook upsert failed (infrastructure issue)")
)

type UpsertWebhookInput struct {
	// SpacePath is the parent space path of the linked repo, used by
	// downstream implementations to derive their own scoping context.
	SpacePath string
	// ConnectorPath and ConnectorIdentifier are the values stored verbatim on
	// the linked_repositories row. The implementation reassembles whatever
	// scoped form (if any) the underlying webhook service expects.
	ConnectorPath       string
	ConnectorIdentifier string
	// CloneURL is the remote clone URL of the repo, resolved via the
	// connector. Forwarded so the downstream service can key the
	// provider-side hook by URL when the connector URL alone does not
	// identify the repo.
	CloneURL string
}

type WebhookService interface {
	UpsertWebhook(ctx context.Context, in UpsertWebhookInput) error
}

type webhookServiceNoop struct{}

func (webhookServiceNoop) UpsertWebhook(context.Context, UpsertWebhookInput) error {
	return errors.InvalidArgument("This feature is not supported.")
}
