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

type LabelStore struct{ mock.Mock }

func (m *LabelStore) Define(_ context.Context, lbl *types.Label) error {
	return m.Called(lbl).Error(0)
}

func (m *LabelStore) Update(_ context.Context, lbl *types.Label) error {
	return m.Called(lbl).Error(0)
}

func (m *LabelStore) Find(_ context.Context, spaceID, repoID *int64, key string) (*types.Label, error) {
	args := m.Called(spaceID, repoID, key)
	if v, _ := args.Get(0).(*types.Label); v != nil {
		return v, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *LabelStore) Delete(_ context.Context, spaceID, repoID *int64, key string) error {
	return m.Called(spaceID, repoID, key).Error(0)
}

func (m *LabelStore) List(
	_ context.Context,
	spaceID, repoID *int64,
	filter *types.LabelFilter,
) ([]*types.Label, error) {
	args := m.Called(spaceID, repoID, filter)
	v, _ := args.Get(0).([]*types.Label)
	err := args.Error(1)
	return v, err
}

func (m *LabelStore) FindByID(_ context.Context, id int64) (*types.Label, error) {
	args := m.Called(id)
	if v, _ := args.Get(0).(*types.Label); v != nil {
		return v, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *LabelStore) FindByIDs(_ context.Context, ids []int64) (map[int64]*types.Label, error) {
	args := m.Called(ids)
	if v, _ := args.Get(0).(map[int64]*types.Label); v != nil {
		return v, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *LabelStore) FindInfosByIDs(_ context.Context, ids []int64) (map[int64]*types.LabelInfo, error) {
	args := m.Called(ids)
	if v, _ := args.Get(0).(map[int64]*types.LabelInfo); v != nil {
		return v, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *LabelStore) ListInScopes(
	_ context.Context,
	repoID int64,
	spaceIDs []int64,
	filter *types.LabelFilter,
) ([]*types.Label, error) {
	args := m.Called(repoID, spaceIDs, filter)
	v, _ := args.Get(0).([]*types.Label)
	err := args.Error(1)
	return v, err
}

func (m *LabelStore) ListInfosInScopes(
	_ context.Context,
	repoID int64,
	spaceIDs []int64,
	filter *types.AssignableLabelFilter,
) ([]*types.LabelInfo, error) {
	args := m.Called(repoID, spaceIDs, filter)
	v, _ := args.Get(0).([]*types.LabelInfo)
	err := args.Error(1)
	return v, err
}

func (m *LabelStore) IncrementValueCount(_ context.Context, labelID int64, increment int) (int64, error) {
	args := m.Called(labelID, increment)
	count, ok := args.Get(0).(int64)
	if !ok {
		return 0, args.Error(1)
	}
	err := args.Error(1)
	return count, err
}

func (m *LabelStore) CountInSpace(_ context.Context, spaceID int64, filter *types.LabelFilter) (int64, error) {
	args := m.Called(spaceID, filter)
	count, ok := args.Get(0).(int64)
	if !ok {
		return 0, args.Error(1)
	}
	err := args.Error(1)
	return count, err
}

func (m *LabelStore) CountInRepo(_ context.Context, repoID int64, filter *types.LabelFilter) (int64, error) {
	args := m.Called(repoID, filter)
	count, ok := args.Get(0).(int64)
	if !ok {
		return 0, args.Error(1)
	}
	err := args.Error(1)
	return count, err
}

func (m *LabelStore) CountInScopes(
	_ context.Context,
	repoID int64,
	spaceIDs []int64,
	filter *types.LabelFilter,
) (int64, error) {
	args := m.Called(repoID, spaceIDs, filter)
	count, ok := args.Get(0).(int64)
	if !ok {
		return 0, args.Error(1)
	}
	err := args.Error(1)
	return count, err
}

func (m *LabelStore) UpdateParentSpace(
	_ context.Context,
	srcParentSpaceID,
	targetParentSpaceID int64,
) (int64, error) {
	args := m.Called(srcParentSpaceID, targetParentSpaceID)
	count, ok := args.Get(0).(int64)
	if !ok {
		return 0, args.Error(1)
	}
	err := args.Error(1)
	return count, err
}
