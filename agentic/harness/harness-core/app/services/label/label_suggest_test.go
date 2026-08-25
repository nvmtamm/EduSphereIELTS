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

package label

import (
	"context"
	stdErrors "errors"
	"fmt"
	"testing"

	"github.com/harness/gitness/errors"
	storemocks "github.com/harness/gitness/mocks/store"
	gitness_store "github.com/harness/gitness/store"
	"github.com/harness/gitness/store/database/dbtx"
	"github.com/harness/gitness/types"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func ptr[T any](v T) *T { return &v }

func newTestService(
	labelStore *storemocks.LabelStore,
	labelValueStore *storemocks.LabelValueStore,
	assignmentStore *storemocks.PullReqLabelAssignmentStore,
) *Service {
	return &Service{
		labelStore:                  labelStore,
		labelValueStore:             labelValueStore,
		pullReqLabelAssignmentStore: assignmentStore,
		// spaceStore not needed by validateSuggestionInputs unless checkLabelInScope
		// hits the SpaceID branch; tests below use repo-scoped labels (RepoID set).
	}
}

type txStub struct {
	withTxFunc func(ctx context.Context, txFn func(ctx context.Context) error, opts ...any) error
}

func (t *txStub) WithTx(ctx context.Context, txFn func(ctx context.Context) error, opts ...any) error {
	if t.withTxFunc != nil {
		return t.withTxFunc(ctx, txFn, opts...)
	}
	return txFn(ctx)
}

type principalInfoCacheStub struct {
	mapFunc func(ctx context.Context, keys []int64) (map[int64]*types.PrincipalInfo, error)
}

func (p *principalInfoCacheStub) Stats() (int64, int64) {
	return 0, 0
}

func (p *principalInfoCacheStub) Get(ctx context.Context, key int64) (*types.PrincipalInfo, error) {
	if p.mapFunc == nil {
		return nil, gitness_store.ErrResourceNotFound
	}
	values, err := p.mapFunc(ctx, []int64{key})
	if err != nil {
		return nil, err
	}
	value, ok := values[key]
	if !ok {
		return nil, gitness_store.ErrResourceNotFound
	}
	return value, nil
}

func (p *principalInfoCacheStub) Evict(_ context.Context, _ int64) {}

func (p *principalInfoCacheStub) Map(
	ctx context.Context,
	keys []int64,
) (map[int64]*types.PrincipalInfo, error) {
	if p.mapFunc != nil {
		return p.mapFunc(ctx, keys)
	}
	return map[int64]*types.PrincipalInfo{}, nil
}

// ---------------------------------------------------------------------------
// CreatePullReqLabelSuggestionInput.Validate
// ---------------------------------------------------------------------------

func TestCreatePullReqLabelSuggestionInput_Validate(t *testing.T) {
	tests := []struct {
		name    string
		input   CreatePullReqLabelSuggestionInput
		wantErr bool
	}{
		{
			name:    "valid without value",
			input:   CreatePullReqLabelSuggestionInput{LabelID: 1},
			wantErr: false,
		},
		{
			name:    "valid with value",
			input:   CreatePullReqLabelSuggestionInput{LabelID: 1, ValueID: ptr(int64(2))},
			wantErr: false,
		},
		{
			name:    "zero label_id",
			input:   CreatePullReqLabelSuggestionInput{LabelID: 0},
			wantErr: true,
		},
		{
			name:    "negative label_id",
			input:   CreatePullReqLabelSuggestionInput{LabelID: -5},
			wantErr: true,
		},
		{
			name:    "zero value_id",
			input:   CreatePullReqLabelSuggestionInput{LabelID: 1, ValueID: ptr(int64(0))},
			wantErr: true,
		},
		{
			name:    "negative value_id",
			input:   CreatePullReqLabelSuggestionInput{LabelID: 1, ValueID: ptr(int64(-1))},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.input.Validate()
			if tc.wantErr {
				require.Error(t, err)
				assert.Equal(t, errors.StatusInvalidArgument, errors.AsStatus(err))
			} else {
				require.NoError(t, err)
			}
		})
	}
}

// ---------------------------------------------------------------------------
// ValidateCreatePullReqLabelSuggestionInputs
// ---------------------------------------------------------------------------

func TestValidateCreatePullReqLabelSuggestionInputs(t *testing.T) {
	tests := []struct {
		name    string
		batch   []*CreatePullReqLabelSuggestionInput
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid batch",
			batch: []*CreatePullReqLabelSuggestionInput{
				{LabelID: 1},
				{LabelID: 2, ValueID: ptr(int64(10))},
			},
			wantErr: false,
		},
		{
			name:    "empty batch",
			batch:   []*CreatePullReqLabelSuggestionInput{},
			wantErr: false,
		},
		{
			name: "invalid field inside batch",
			batch: []*CreatePullReqLabelSuggestionInput{
				{LabelID: 0},
			},
			wantErr: true,
		},
		{
			name: "duplicate label_id",
			batch: []*CreatePullReqLabelSuggestionInput{
				{LabelID: 1},
				{LabelID: 1},
			},
			wantErr: true,
			errMsg:  "duplicate label_id",
		},
		{
			name: "duplicate label_id with different value_ids",
			batch: []*CreatePullReqLabelSuggestionInput{
				{LabelID: 1, ValueID: ptr(int64(10))},
				{LabelID: 1, ValueID: ptr(int64(20))},
			},
			wantErr: true,
			errMsg:  "duplicate label_id",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := ValidateCreatePullReqLabelSuggestionInputs(tc.batch)
			if tc.wantErr {
				require.Error(t, err)
				assert.Equal(t, errors.StatusInvalidArgument, errors.AsStatus(err))
				if tc.errMsg != "" {
					assert.Contains(t, err.Error(), tc.errMsg)
				}
			} else {
				require.NoError(t, err)
			}
		})
	}
}

// ---------------------------------------------------------------------------
// validateSuggestionInputs
// ---------------------------------------------------------------------------

func TestValidateSuggestionInputs_SkipsAlreadyAssigned(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	repoID := int64(10)
	repoParentID := int64(1)
	pullreqID := int64(100)

	// Label 1 already assigned, label 2 not assigned.
	assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{
		1: {LabelInfo: types.LabelInfo{ID: 1}},
	}, nil)

	labelStore.On("FindByIDs", mock.MatchedBy(func(ids []int64) bool {
		return len(ids) == 1 && ids[0] == 2
	})).Return(map[int64]*types.Label{
		2: {ID: 2, RepoID: &repoID},
	}, nil)

	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(
		map[int64][]*types.LabelValueInfo{}, nil,
	)

	in := []*CreatePullReqLabelSuggestionInput{
		{LabelID: 1},
		{LabelID: 2},
	}

	got, err := svc.validateSuggestionInputs(context.Background(), repoParentID, repoID, pullreqID, in)
	require.NoError(t, err)
	require.Len(t, got, 1)
	assert.Equal(t, int64(2), got[0].LabelID)
}

func TestValidateSuggestionInputs_AllAssigned_ReturnsEmpty(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	assignStore.On("ListAssigned", int64(100)).Return(map[int64]*types.LabelAssignment{
		1: {},
		2: {},
	}, nil)

	in := []*CreatePullReqLabelSuggestionInput{{LabelID: 1}, {LabelID: 2}}
	got, err := svc.validateSuggestionInputs(context.Background(), 1, 10, 100, in)
	require.NoError(t, err)
	assert.Empty(t, got)
}

func TestValidateSuggestionInputs_MissingLabel_ReturnsError(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	assignStore.On("ListAssigned", int64(100)).Return(map[int64]*types.LabelAssignment{}, nil)

	// Only label 1 returned; label 2 is "missing".
	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1},
	}, nil)

	in := []*CreatePullReqLabelSuggestionInput{{LabelID: 1}, {LabelID: 2}}
	_, err := svc.validateSuggestionInputs(context.Background(), 1, 10, 100, in)
	require.Error(t, err)
	assert.Equal(t, errors.StatusInvalidArgument, errors.AsStatus(err))
	assert.Contains(t, err.Error(), "label not found")
}

func TestValidateSuggestionInputs_LabelRequiresValue_MissingValue_ReturnsError(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	pullreqID := int64(100)
	assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{}, nil)

	// Label 1 has values (ValueCount > 0) but no ValueID provided.
	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1, ValueCount: 3},
	}, nil)

	in := []*CreatePullReqLabelSuggestionInput{{LabelID: 1}}
	_, err := svc.validateSuggestionInputs(context.Background(), 1, 10, pullreqID, in)
	require.Error(t, err)
	assert.Equal(t, errors.StatusInvalidArgument, errors.AsStatus(err))
	assert.Contains(t, err.Error(), "requires a value")
}

func TestValidateSuggestionInputs_InvalidValueForLabel_ReturnsError(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	pullreqID := int64(100)
	assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{}, nil)

	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1, ValueCount: 0}, // ValueCount 0: value not required but still provided
	}, nil)

	// The store returns value 99 for label 1, but the input asks for value 999.
	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(map[int64][]*types.LabelValueInfo{
		1: {{ID: ptr(int64(99))}},
	}, nil)

	in := []*CreatePullReqLabelSuggestionInput{{LabelID: 1, ValueID: ptr(int64(999))}}
	_, err := svc.validateSuggestionInputs(context.Background(), 1, 10, pullreqID, in)
	require.Error(t, err)
	assert.Equal(t, errors.StatusInvalidArgument, errors.AsStatus(err))
	assert.Contains(t, err.Error(), "label value does not belong to the label")
}

func TestValidateSuggestionInputs_LabelNotInRepoScope_ReturnsError(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	repoID := int64(10)
	otherRepoID := int64(99)
	pullreqID := int64(100)

	assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{}, nil)

	// Label belongs to a different repo.
	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1, RepoID: &otherRepoID},
	}, nil)

	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(
		map[int64][]*types.LabelValueInfo{}, nil,
	)

	in := []*CreatePullReqLabelSuggestionInput{{LabelID: 1}}
	_, err := svc.validateSuggestionInputs(context.Background(), 1, repoID, pullreqID, in)
	require.Error(t, err)
	assert.Equal(t, errors.StatusInvalidArgument, errors.AsStatus(err))
	assert.Contains(t, err.Error(), "label not in scope")
}

func TestValidateSuggestionInputs_StoreError_Propagates(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	storeErr := fmt.Errorf("db unavailable")
	assignStore.On("ListAssigned", mock.Anything).Return(nil, storeErr)

	in := []*CreatePullReqLabelSuggestionInput{{LabelID: 1}}
	_, err := svc.validateSuggestionInputs(context.Background(), 1, 10, 100, in)
	require.Error(t, err)
	assert.ErrorContains(t, err, "db unavailable")
}

func TestValidateSuggestionInputs_ListAssignedStoreError_Propagates(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	assignStore.On("ListAssigned", mock.Anything).Return(nil, gitness_store.ErrResourceNotFound)

	_, err := svc.validateSuggestionInputs(context.Background(), 1, 10, 100,
		[]*CreatePullReqLabelSuggestionInput{{LabelID: 1}})
	require.Error(t, err)
}

func TestValidateSuggestionInputs_ValidWithMatchingValue(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	repoID := int64(10)
	pullreqID := int64(100)

	assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{}, nil)

	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1, RepoID: &repoID, ValueCount: 0},
	}, nil)

	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(map[int64][]*types.LabelValueInfo{
		1: {{ID: ptr(int64(5))}},
	}, nil)

	in := []*CreatePullReqLabelSuggestionInput{{LabelID: 1, ValueID: ptr(int64(5))}}
	got, err := svc.validateSuggestionInputs(context.Background(), 1, repoID, pullreqID, in)
	require.NoError(t, err)
	require.Len(t, got, 1)
	assert.Equal(t, int64(1), got[0].LabelID)
	assert.Equal(t, int64(5), *got[0].ValueID)
}

func TestValidateSuggestionInputs_DeduplicatesOnLabelID(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	repoID := int64(10)
	pullreqID := int64(100)

	assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{}, nil)

	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1, RepoID: &repoID},
	}, nil)

	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(
		map[int64][]*types.LabelValueInfo{}, nil,
	)

	// Two entries with the same label ID — only one should survive dedup.
	in := []*CreatePullReqLabelSuggestionInput{
		{LabelID: 1},
		{LabelID: 1},
	}
	got, err := svc.validateSuggestionInputs(context.Background(), 1, repoID, pullreqID, in)
	require.NoError(t, err)
	assert.Len(t, got, 1)
	assert.Equal(t, int64(1), got[0].LabelID)
}

func TestValidateSuggestionInputs_FindByIDsError_Propagates(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	assignStore.On("ListAssigned", mock.Anything).Return(map[int64]*types.LabelAssignment{}, nil)
	labelStore.On("FindByIDs", mock.Anything).Return(nil, fmt.Errorf("label store failure"))

	_, err := svc.validateSuggestionInputs(context.Background(), 1, 10, 100,
		[]*CreatePullReqLabelSuggestionInput{{LabelID: 1}})
	require.Error(t, err)
	assert.ErrorContains(t, err, "label store failure")
}

func TestValidateSuggestionInputs_ListInfosError_Propagates(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	svc := newTestService(labelStore, valueStore, assignStore)

	repoID := int64(10)
	assignStore.On("ListAssigned", mock.Anything).Return(map[int64]*types.LabelAssignment{}, nil)
	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1, RepoID: &repoID},
	}, nil)
	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(nil, fmt.Errorf("value store failure"))

	_, err := svc.validateSuggestionInputs(context.Background(), 1, repoID, 100,
		[]*CreatePullReqLabelSuggestionInput{{LabelID: 1, ValueID: ptr(int64(5))}})
	require.Error(t, err)
	assert.ErrorContains(t, err, "value store failure")
}

func TestCreateSuggestions_CreatesSuggestions(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	suggestionStore := &storemocks.PullReqLabelSuggestionStore{}
	svc := newTestService(labelStore, valueStore, assignStore)
	svc.pullreqLabelSuggestionStore = suggestionStore

	repoID := int64(10)
	pullreqID := int64(100)
	principalID := int64(200)
	valueID := int64(5)

	assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{}, nil)
	labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
		1: {ID: 1, RepoID: &repoID},
	}, nil)
	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(map[int64][]*types.LabelValueInfo{
		1: {{ID: ptr(valueID)}},
	}, nil)
	suggestionStore.On("CreateMany", mock.MatchedBy(func(suggestions []*types.PullReqLabelSuggestion) bool {
		if len(suggestions) != 1 {
			return false
		}
		suggestion := suggestions[0]
		return suggestion.PullReqID == pullreqID &&
			suggestion.PrincipalID == principalID &&
			suggestion.LabelID == 1 &&
			suggestion.ValueID != nil && *suggestion.ValueID == valueID
	})).Return(nil)

	err := svc.CreateSuggestions(context.Background(), 1, repoID, principalID, pullreqID,
		[]*CreatePullReqLabelSuggestionInput{{LabelID: 1, ValueID: ptr(valueID)}})
	require.NoError(t, err)

	suggestionStore.AssertExpectations(t)
}

func TestCreateSuggestions_NoSuggestableInputs_SkipsCreate(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	suggestionStore := &storemocks.PullReqLabelSuggestionStore{}
	svc := newTestService(labelStore, valueStore, assignStore)
	svc.pullreqLabelSuggestionStore = suggestionStore

	assignStore.On("ListAssigned", int64(100)).Return(map[int64]*types.LabelAssignment{
		1: {LabelInfo: types.LabelInfo{ID: 1}},
	}, nil)

	err := svc.CreateSuggestions(context.Background(), 1, 10, 200, 100,
		[]*CreatePullReqLabelSuggestionInput{{LabelID: 1}})
	require.NoError(t, err)

	suggestionStore.AssertNotCalled(t, "CreateMany", mock.Anything)
}

func TestCreateSuggestions_ErrorPaths(t *testing.T) {
	tests := []struct {
		name  string
		setup func(
			labelStore *storemocks.LabelStore,
			valueStore *storemocks.LabelValueStore,
			assignStore *storemocks.PullReqLabelAssignmentStore,
			suggestionStore *storemocks.PullReqLabelSuggestionStore,
		)
	}{
		{
			name: "validate failure",
			setup: func(
				_ *storemocks.LabelStore,
				_ *storemocks.LabelValueStore,
				assignStore *storemocks.PullReqLabelAssignmentStore,
				_ *storemocks.PullReqLabelSuggestionStore,
			) {
				assignStore.On("ListAssigned", int64(100)).Return(nil, fmt.Errorf("any error"))
			},
		},
		{
			name: "create many failure",
			setup: func(
				labelStore *storemocks.LabelStore,
				valueStore *storemocks.LabelValueStore,
				assignStore *storemocks.PullReqLabelAssignmentStore,
				suggestionStore *storemocks.PullReqLabelSuggestionStore,
			) {
				repoID := int64(10)
				pullreqID := int64(100)
				assignStore.On("ListAssigned", pullreqID).Return(map[int64]*types.LabelAssignment{}, nil)
				labelStore.On("FindByIDs", mock.Anything).Return(map[int64]*types.Label{
					1: {ID: 1, RepoID: &repoID},
				}, nil)
				valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(
					map[int64][]*types.LabelValueInfo{}, nil,
				)
				suggestionStore.On("CreateMany", mock.Anything).Return(fmt.Errorf("any error"))
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			labelStore := &storemocks.LabelStore{}
			valueStore := &storemocks.LabelValueStore{}
			assignStore := &storemocks.PullReqLabelAssignmentStore{}
			suggestionStore := &storemocks.PullReqLabelSuggestionStore{}
			svc := newTestService(labelStore, valueStore, assignStore)
			svc.pullreqLabelSuggestionStore = suggestionStore
			tc.setup(labelStore, valueStore, assignStore, suggestionStore)

			err := svc.CreateSuggestions(context.Background(), 1, 10, 200, 100,
				[]*CreatePullReqLabelSuggestionInput{{LabelID: 1}})
			require.Error(t, err)
		})
	}
}

func TestListSuggestions_EnrichesResultsAndSkipsCountOnShortFirstPage(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	suggestionStore := &storemocks.PullReqLabelSuggestionStore{}
	tx := &txStub{}
	principalCache := &principalInfoCacheStub{
		mapFunc: func(_ context.Context, keys []int64) (map[int64]*types.PrincipalInfo, error) {
			assert.ElementsMatch(t, []int64{11, 12}, keys)
			return map[int64]*types.PrincipalInfo{
				11: {ID: 11, DisplayName: "one"},
				12: {ID: 12, DisplayName: "two"},
			}, nil
		},
	}
	svc := &Service{
		tx:                          tx,
		labelStore:                  labelStore,
		labelValueStore:             valueStore,
		pullreqLabelSuggestionStore: suggestionStore,
		principalInfoCache:          principalCache,
	}

	valueID := int64(21)
	filter := types.ListQueryFilter{Pagination: types.Pagination{Page: 1, Size: 10}}
	suggestionStore.On("List", int64(100), filter).Return([]*types.PullReqLabelSuggestion{
		{PullReqID: 100, PrincipalID: 11, LabelID: 1, ValueID: &valueID, CreatedAt: 123},
		{PullReqID: 100, PrincipalID: 12, LabelID: 2, CreatedAt: 456},
	}, nil)
	labelStore.On("FindInfosByIDs", mock.MatchedBy(func(ids []int64) bool {
		return len(ids) == 2
	})).Return(map[int64]*types.LabelInfo{
		1: {ID: 1, Key: "bug"},
		2: {ID: 2, Key: "area"},
	}, nil)
	valueStore.On("ListInfosByLabelIDs", mock.Anything).Return(map[int64][]*types.LabelValueInfo{
		1: {{ID: ptr(valueID)}},
	}, nil)

	responses, count, err := svc.ListSuggestions(context.Background(), 100, filter)
	require.NoError(t, err)
	require.Len(t, responses, 2)
	assert.Equal(t, int64(2), count)
	assert.Equal(t, int64(1), responses[0].Label.ID)
	assert.NotNil(t, responses[0].Value)
	assert.Equal(t, valueID, *responses[0].Value.ID)
	assert.Equal(t, int64(11), responses[0].SuggestedBy.ID)
	assert.Nil(t, responses[1].Value)
	assert.Equal(t, int64(12), responses[1].SuggestedBy.ID)

	suggestionStore.AssertNotCalled(t, "Count", mock.Anything)
}

func TestListSuggestions_ErrorPaths(t *testing.T) {
	tests := []struct {
		name             string
		withTxFunc       func(context.Context, func(context.Context) error, ...any) error
		setupStores      func(*storemocks.PullReqLabelSuggestionStore, *storemocks.LabelStore, *storemocks.LabelValueStore)
		principalCacheFn func(context.Context, []int64) (map[int64]*types.PrincipalInfo, error)
	}{
		{
			name: "tx failure",
			withTxFunc: func(context.Context, func(context.Context) error, ...any) error {
				return fmt.Errorf("any error")
			},
		},
		{
			name: "list failure",
			setupStores: func(
				s *storemocks.PullReqLabelSuggestionStore,
				_ *storemocks.LabelStore,
				_ *storemocks.LabelValueStore,
			) {
				filter := types.ListQueryFilter{Pagination: types.Pagination{Page: 2, Size: 1}}
				s.On("List", int64(100), filter).Return(nil, fmt.Errorf("any error"))
			},
		},
		{
			name: "count failure",
			setupStores: func(
				s *storemocks.PullReqLabelSuggestionStore,
				_ *storemocks.LabelStore,
				_ *storemocks.LabelValueStore,
			) {
				filter := types.ListQueryFilter{Pagination: types.Pagination{Page: 2, Size: 1}}
				s.On("List", int64(100), filter).Return([]*types.PullReqLabelSuggestion{{PullReqID: 100, LabelID: 1}}, nil)
				s.On("Count", int64(100)).Return(int64(0), fmt.Errorf("any error"))
			},
		},
		{
			name: "label infos failure",
			setupStores: func(
				s *storemocks.PullReqLabelSuggestionStore,
				l *storemocks.LabelStore,
				_ *storemocks.LabelValueStore,
			) {
				filter := types.ListQueryFilter{Pagination: types.Pagination{Page: 2, Size: 1}}
				s.On("List", int64(100), filter).Return([]*types.PullReqLabelSuggestion{{PullReqID: 100, LabelID: 1}}, nil)
				s.On("Count", int64(100)).Return(int64(1), nil)
				l.On("FindInfosByIDs", mock.Anything).Return(nil, fmt.Errorf("any error"))
			},
		},
		{
			name: "label values failure",
			setupStores: func(
				s *storemocks.PullReqLabelSuggestionStore,
				l *storemocks.LabelStore,
				v *storemocks.LabelValueStore,
			) {
				filter := types.ListQueryFilter{Pagination: types.Pagination{Page: 2, Size: 1}}
				s.On("List", int64(100), filter).Return([]*types.PullReqLabelSuggestion{{PullReqID: 100, LabelID: 1}}, nil)
				s.On("Count", int64(100)).Return(int64(1), nil)
				l.On("FindInfosByIDs", mock.Anything).Return(map[int64]*types.LabelInfo{1: {ID: 1}}, nil)
				v.On("ListInfosByLabelIDs", mock.Anything).Return(nil, fmt.Errorf("any error"))
			},
		},
		{
			name: "principal infos failure",
			setupStores: func(
				s *storemocks.PullReqLabelSuggestionStore,
				l *storemocks.LabelStore,
				v *storemocks.LabelValueStore,
			) {
				filter := types.ListQueryFilter{Pagination: types.Pagination{Page: 2, Size: 1}}
				s.On("List", int64(100), filter).Return([]*types.PullReqLabelSuggestion{
					{PullReqID: 100, LabelID: 1, PrincipalID: 11},
				}, nil)
				s.On("Count", int64(100)).Return(int64(1), nil)
				l.On("FindInfosByIDs", mock.Anything).Return(map[int64]*types.LabelInfo{1: {ID: 1}}, nil)
				v.On("ListInfosByLabelIDs", mock.Anything).Return(map[int64][]*types.LabelValueInfo{}, nil)
			},
			principalCacheFn: func(context.Context, []int64) (map[int64]*types.PrincipalInfo, error) {
				return nil, fmt.Errorf("any error")
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			suggestionStore := &storemocks.PullReqLabelSuggestionStore{}
			labelStore := &storemocks.LabelStore{}
			valueStore := &storemocks.LabelValueStore{}
			tx := &txStub{withTxFunc: tc.withTxFunc}
			principalCache := &principalInfoCacheStub{mapFunc: tc.principalCacheFn}
			svc := &Service{
				tx:                          tx,
				labelStore:                  labelStore,
				labelValueStore:             valueStore,
				pullreqLabelSuggestionStore: suggestionStore,
				principalInfoCache:          principalCache,
			}
			if tc.setupStores != nil {
				tc.setupStores(suggestionStore, labelStore, valueStore)
			}

			_, _, err := svc.ListSuggestions(context.Background(), 100,
				types.ListQueryFilter{Pagination: types.Pagination{Page: 2, Size: 1}})
			require.Error(t, err)
		})
	}
}

func TestApplySuggestion_AssignsAndDeletesSuggestion(t *testing.T) {
	labelStore := &storemocks.LabelStore{}
	valueStore := &storemocks.LabelValueStore{}
	assignStore := &storemocks.PullReqLabelAssignmentStore{}
	suggestionStore := &storemocks.PullReqLabelSuggestionStore{}
	tx := &txStub{
		withTxFunc: func(ctx context.Context, txFn func(ctx context.Context) error, opts ...any) error {
			require.Len(t, opts, 0)
			return txFn(ctx)
		},
	}
	svc := &Service{
		tx:                          tx,
		labelStore:                  labelStore,
		labelValueStore:             valueStore,
		pullReqLabelAssignmentStore: assignStore,
		pullreqLabelSuggestionStore: suggestionStore,
	}

	repoID := int64(10)
	principalID := int64(20)
	pullreqID := int64(100)
	labelID := int64(1)

	suggestionStore.On("Find", pullreqID, labelID).Return(&types.PullReqLabelSuggestion{
		PullReqID: pullreqID,
		LabelID:   labelID,
	}, nil)
	labelStore.On("FindByID", labelID).Return(&types.Label{ID: labelID, RepoID: &repoID}, nil)
	assignStore.
		On("FindByLabelID", pullreqID, labelID).
		Return((*types.PullReqLabel)(nil), gitness_store.ErrResourceNotFound)
	assignStore.On("Assign", mock.MatchedBy(func(label *types.PullReqLabel) bool {
		return label.PullReqID == pullreqID && label.LabelID == labelID
	})).Return(nil)
	suggestionStore.On("Delete", pullreqID, labelID).Return(nil)

	out, err := svc.ApplySuggestion(context.Background(), principalID, pullreqID, repoID, 1, labelID)
	require.NoError(t, err)
	require.NotNil(t, out)
	assert.Equal(t, labelID, out.Label.ID)
	assert.Equal(t, pullreqID, out.PullReqLabel.PullReqID)

	suggestionStore.AssertExpectations(t)
	assignStore.AssertExpectations(t)
}

func TestApplySuggestion_ErrorPaths(t *testing.T) {
	tests := []struct {
		name  string
		setup func(
			*storemocks.PullReqLabelSuggestionStore,
			*storemocks.LabelStore,
			*storemocks.PullReqLabelAssignmentStore,
		)
		sentinelErr  error
		assertIsSent bool
	}{
		{
			name: "find failure",
			setup: func(
				s *storemocks.PullReqLabelSuggestionStore,
				_ *storemocks.LabelStore,
				_ *storemocks.PullReqLabelAssignmentStore,
			) {
				s.On("Find", int64(100), int64(1)).Return(
					(*types.PullReqLabelSuggestion)(nil), fmt.Errorf("any error"),
				)
			},
		},
		{
			name: "find sentinel preserved",
			setup: func(
				s *storemocks.PullReqLabelSuggestionStore,
				_ *storemocks.LabelStore,
				_ *storemocks.PullReqLabelAssignmentStore,
			) {
				s.On("Find", int64(100), int64(1)).Return(
					(*types.PullReqLabelSuggestion)(nil), gitness_store.ErrResourceNotFound,
				)
			},
			sentinelErr:  gitness_store.ErrResourceNotFound,
			assertIsSent: true,
		},
		{
			name: "assign path failure",
			setup: func(
				s *storemocks.PullReqLabelSuggestionStore,
				l *storemocks.LabelStore,
				_ *storemocks.PullReqLabelAssignmentStore,
			) {
				s.On("Find", int64(100), int64(1)).Return(
					&types.PullReqLabelSuggestion{PullReqID: 100, LabelID: 1}, nil,
				)
				l.On("FindByID", int64(1)).Return(nil, fmt.Errorf("any error"))
			},
		},
		{
			name: "delete failure",
			setup: func(
				s *storemocks.PullReqLabelSuggestionStore,
				l *storemocks.LabelStore,
				a *storemocks.PullReqLabelAssignmentStore,
			) {
				repoID := int64(10)
				s.On("Find", int64(100), int64(1)).Return(
					&types.PullReqLabelSuggestion{PullReqID: 100, LabelID: 1}, nil,
				)
				l.On("FindByID", int64(1)).Return(&types.Label{ID: 1, RepoID: &repoID}, nil)
				a.On("FindByLabelID", int64(100), int64(1)).Return((*types.PullReqLabel)(nil), gitness_store.ErrResourceNotFound)
				a.On("Assign", mock.Anything).Return(nil)
				s.On("Delete", int64(100), int64(1)).Return(fmt.Errorf("any error"))
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			labelStore := &storemocks.LabelStore{}
			valueStore := &storemocks.LabelValueStore{}
			assignStore := &storemocks.PullReqLabelAssignmentStore{}
			suggestionStore := &storemocks.PullReqLabelSuggestionStore{}
			svc := &Service{
				tx:                          &txStub{},
				labelStore:                  labelStore,
				labelValueStore:             valueStore,
				pullReqLabelAssignmentStore: assignStore,
				pullreqLabelSuggestionStore: suggestionStore,
			}
			tc.setup(suggestionStore, labelStore, assignStore)

			_, err := svc.ApplySuggestion(context.Background(), 20, 100, 10, 1, 1)
			require.Error(t, err)
			if tc.assertIsSent {
				assert.True(t, stdErrors.Is(err, tc.sentinelErr))
			}
		})
	}
}

var _ dbtx.Transactor = (*txStub)(nil)
