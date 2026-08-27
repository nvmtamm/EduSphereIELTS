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

package store

import (
	"context"

	"github.com/harness/gitness/types"

	"github.com/stretchr/testify/mock"
)

type PullReqLabelSuggestionStore struct{ mock.Mock }

func (m *PullReqLabelSuggestionStore) CreateMany(
	_ context.Context,
	suggestions []*types.PullReqLabelSuggestion,
) error {
	return m.Called(suggestions).Error(0)
}

func (m *PullReqLabelSuggestionStore) List(
	_ context.Context,
	pullreqID int64,
	filter types.ListQueryFilter,
) ([]*types.PullReqLabelSuggestion, error) {
	args := m.Called(pullreqID, filter)
	if v, _ := args.Get(0).([]*types.PullReqLabelSuggestion); v != nil {
		err := args.Error(1)
		return v, err
	}
	err := args.Error(1)
	return nil, err
}

func (m *PullReqLabelSuggestionStore) Count(
	_ context.Context,
	pullreqID int64,
) (int64, error) {
	args := m.Called(pullreqID)
	count, ok := args.Get(0).(int64)
	if !ok {
		return 0, args.Error(1)
	}
	err := args.Error(1)
	return count, err
}

func (m *PullReqLabelSuggestionStore) Find(
	_ context.Context,
	pullreqID int64,
	labelID int64,
) (*types.PullReqLabelSuggestion, error) {
	args := m.Called(pullreqID, labelID)
	if v, _ := args.Get(0).(*types.PullReqLabelSuggestion); v != nil {
		err := args.Error(1)
		return v, err
	}
	err := args.Error(1)
	return nil, err
}

func (m *PullReqLabelSuggestionStore) Delete(
	_ context.Context,
	pullreqID int64,
	labelID int64,
) error {
	return m.Called(pullreqID, labelID).Error(0)
}
