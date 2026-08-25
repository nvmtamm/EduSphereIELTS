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

type LabelValueStore struct{ mock.Mock }

func (m *LabelValueStore) Define(_ context.Context, lbl *types.LabelValue) error {
	return m.Called(lbl).Error(0)
}

func (m *LabelValueStore) Update(_ context.Context, lbl *types.LabelValue) error {
	return m.Called(lbl).Error(0)
}

func (m *LabelValueStore) Delete(_ context.Context, labelID int64, value string) error {
	return m.Called(labelID, value).Error(0)
}

func (m *LabelValueStore) DeleteMany(_ context.Context, labelID int64, values []string) error {
	return m.Called(labelID, values).Error(0)
}

func (m *LabelValueStore) FindByLabelID(_ context.Context, labelID int64, value string) (*types.LabelValue, error) {
	args := m.Called(labelID, value)
	if v, _ := args.Get(0).(*types.LabelValue); v != nil {
		return v, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *LabelValueStore) List(
	_ context.Context,
	labelID int64,
	opts types.ListQueryFilter,
) ([]*types.LabelValue, error) {
	args := m.Called(labelID, opts)
	v, _ := args.Get(0).([]*types.LabelValue)
	err := args.Error(1)
	return v, err
}

func (m *LabelValueStore) Count(_ context.Context, labelID int64, opts types.ListQueryFilter) (int64, error) {
	args := m.Called(labelID, opts)
	count, ok := args.Get(0).(int64)
	if !ok {
		return 0, args.Error(1)
	}
	err := args.Error(1)
	return count, err
}

func (m *LabelValueStore) FindByID(_ context.Context, id int64) (*types.LabelValue, error) {
	args := m.Called(id)
	if v, _ := args.Get(0).(*types.LabelValue); v != nil {
		return v, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *LabelValueStore) ListInfosByLabelIDs(
	_ context.Context,
	labelIDs []int64,
) (map[int64][]*types.LabelValueInfo, error) {
	args := m.Called(labelIDs)
	if v, _ := args.Get(0).(map[int64][]*types.LabelValueInfo); v != nil {
		err := args.Error(1)
		return v, err
	}
	err := args.Error(1)
	return nil, err
}
