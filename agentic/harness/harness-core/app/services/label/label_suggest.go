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
	"fmt"
	"maps"
	"slices"
	"strings"

	"github.com/harness/gitness/errors"
	"github.com/harness/gitness/store/database/dbtx"
	"github.com/harness/gitness/types"
)

// CreatePullReqLabelSuggestionInput is the request input for suggesting labels.
type CreatePullReqLabelSuggestionInput struct {
	LabelID int64  `json:"label_id"`
	ValueID *int64 `json:"value_id,omitempty"`
}

// CreatePullReqLabelSuggestionsRequest is the request body for batch label suggestions.
type CreatePullReqLabelSuggestionsRequest struct {
	Labels []*CreatePullReqLabelSuggestionInput `json:"labels"`
}

// Validate checks the request body for required labels, item validity, and duplicate label IDs.
func (in *CreatePullReqLabelSuggestionsRequest) Validate() error {
	if in.Labels == nil {
		return errors.InvalidArgument("labels is required")
	}

	seen := make(map[int64]bool, len(in.Labels))
	for _, suggestion := range in.Labels {
		if suggestion == nil {
			return errors.InvalidArgument("suggestion item must not be null")
		}

		// Validate individual fields.
		if err := suggestion.Validate(); err != nil {
			return err
		}

		// Check for duplicates.
		if seen[suggestion.LabelID] {
			return errors.InvalidArgument("duplicate label_id in suggestion batch")
		}
		seen[suggestion.LabelID] = true
	}

	return nil
}

func (in *CreatePullReqLabelSuggestionInput) Validate() error {
	if in.LabelID <= 0 {
		return errors.InvalidArgument("label_id must be greater than 0")
	}
	if in.ValueID != nil && *in.ValueID <= 0 {
		return errors.InvalidArgument("value_id must be greater than 0")
	}
	return nil
}

// ValidateCreatePullReqLabelSuggestionInputs validates a batch of suggestion inputs
// for individual field validity and duplicate label IDs.
func ValidateCreatePullReqLabelSuggestionInputs(
	batch []*CreatePullReqLabelSuggestionInput,
) error {
	return (&CreatePullReqLabelSuggestionsRequest{Labels: batch}).Validate()
}

// ValidateSuggestionInputs validates a batch of suggestion inputs using bulk DB lookups.
// It returns only suggestable inputs and skips labels already assigned to the pull request.
func (s *Service) validateSuggestionInputs(
	ctx context.Context,
	repoParentID int64,
	repoID int64,
	pullreqID int64,
	in []*CreatePullReqLabelSuggestionInput,
) ([]*CreatePullReqLabelSuggestionInput, error) {
	assignedByLabelID, err := s.pullReqLabelAssignmentStore.ListAssigned(ctx, pullreqID)
	if err != nil {
		return nil, fmt.Errorf("failed to list labels assigned to pullreq: %w", err)
	}

	suggestableInputs := make([]*CreatePullReqLabelSuggestionInput, 0, len(in))
	for _, suggestion := range in {
		if _, isAssigned := assignedByLabelID[suggestion.LabelID]; isAssigned {
			continue
		}
		suggestableInputs = append(suggestableInputs, suggestion)
	}

	if len(suggestableInputs) == 0 {
		return []*CreatePullReqLabelSuggestionInput{}, nil
	}

	// Dedup on LabelID, keeping the last occurrence (map automatically overwrites duplicates)
	indexed := make(map[int64]*CreatePullReqLabelSuggestionInput, len(suggestableInputs))
	for _, suggestion := range suggestableInputs {
		indexed[suggestion.LabelID] = suggestion
	}
	suggestableInputs = slices.Collect(maps.Values(indexed))

	labelIDs := make([]int64, 0, len(suggestableInputs))
	for _, suggestion := range suggestableInputs {
		labelIDs = append(labelIDs, suggestion.LabelID)
	}
	slices.Sort(labelIDs)
	labelIDs = slices.Compact(labelIDs)

	labels, err := s.labelStore.FindByIDs(ctx, labelIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to find labels: %w", err)
	}

	// All requested label IDs must exist.
	missingLabelIDs := make([]int64, 0)
	for _, labelID := range labelIDs {
		if _, ok := labels[labelID]; !ok {
			missingLabelIDs = append(missingLabelIDs, labelID)
		}
	}
	if len(missingLabelIDs) > 0 {
		return nil, errors.InvalidArgument(fmt.Sprintf("label not found: %v", missingLabelIDs))
	}

	// Labels that require a value must have one provided.
	missingValueLabelIDs := make([]int64, 0)
	for _, suggestion := range suggestableInputs {
		if labels[suggestion.LabelID].ValueCount > 0 && suggestion.ValueID == nil {
			missingValueLabelIDs = append(missingValueLabelIDs, suggestion.LabelID)
		}
	}
	slices.Sort(missingValueLabelIDs)
	missingValueLabelIDs = slices.Compact(missingValueLabelIDs)
	if len(missingValueLabelIDs) > 0 {
		return nil, errors.InvalidArgument(fmt.Sprintf("label(s) requires a value: %v", missingValueLabelIDs))
	}

	// Each provided value ID must belong to the corresponding label.
	valueInfosByLabelID, err := s.labelValueStore.ListInfosByLabelIDs(ctx, labelIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to find label values: %w", err)
	}

	invalidValuePairs := make([]string, 0)
	for _, suggestion := range suggestableInputs {
		if suggestion.ValueID == nil {
			continue
		}
		found := false
		for _, vi := range valueInfosByLabelID[suggestion.LabelID] {
			if vi.ID != nil && *vi.ID == *suggestion.ValueID {
				found = true
				break
			}
		}
		if !found {
			invalidValuePairs = append(invalidValuePairs,
				fmt.Sprintf("(label_id=%d,value_id=%d)", suggestion.LabelID, *suggestion.ValueID))
		}
	}
	if len(invalidValuePairs) > 0 {
		return nil, errors.InvalidArgument(fmt.Sprintf("label value does not belong to the label: %s",
			strings.Join(invalidValuePairs, ", ")))
	}

	// All labels must be in scope for this repo.
	outOfScopeLabelIDs := make([]int64, 0)
	for _, labelID := range labelIDs {
		if err := s.checkLabelInScope(ctx, repoParentID, repoID, labels[labelID]); err != nil {
			outOfScopeLabelIDs = append(outOfScopeLabelIDs, labelID)
		}
	}
	if len(outOfScopeLabelIDs) > 0 {
		return nil, errors.InvalidArgument(fmt.Sprintf("label not in scope: %v", outOfScopeLabelIDs))
	}

	return suggestableInputs, nil
}

// CreateSuggestions validates and creates label suggestions for a pull request.
func (s *Service) CreateSuggestions(
	ctx context.Context,
	repoParentID int64,
	repoID int64,
	principalID int64,
	pullreqID int64,
	in []*CreatePullReqLabelSuggestionInput,
) error {
	// Validate all labels, values, and scope
	filteredInputs, err := s.validateSuggestionInputs(ctx, repoParentID, repoID, pullreqID, in)
	if err != nil {
		return err
	}

	if len(filteredInputs) == 0 {
		return nil
	}

	suggestions := make([]*types.PullReqLabelSuggestion, 0, len(filteredInputs))
	for _, suggestion := range filteredInputs {
		suggestions = append(suggestions, &types.PullReqLabelSuggestion{
			PullReqID:   pullreqID,
			PrincipalID: principalID,
			LabelID:     suggestion.LabelID,
			ValueID:     suggestion.ValueID,
		})
	}

	return s.pullreqLabelSuggestionStore.CreateMany(ctx, suggestions)
}

// ListSuggestions lists and enriches label suggestions for a pull request.
func (s *Service) ListSuggestions(
	ctx context.Context,
	pullreqID int64,
	filter types.ListQueryFilter,
) ([]*types.PullReqLabelSuggestionResponse, int64, error) {
	var count int64
	var suggestions []*types.PullReqLabelSuggestion

	err := s.tx.WithTx(ctx, func(ctx context.Context) error {
		var err error
		suggestions, err = s.pullreqLabelSuggestionStore.List(ctx, pullreqID, filter)
		if err != nil {
			return fmt.Errorf("failed to list label suggestions: %w", err)
		}

		if filter.Page == 1 && len(suggestions) < filter.Size {
			count = int64(len(suggestions))
			return nil
		}

		count, err = s.pullreqLabelSuggestionStore.Count(ctx, pullreqID)
		if err != nil {
			return fmt.Errorf("failed to count label suggestions: %w", err)
		}

		return nil
	}, dbtx.TxDefaultReadOnly)
	if err != nil {
		return nil, 0, err
	}

	if len(suggestions) == 0 {
		return []*types.PullReqLabelSuggestionResponse{}, 0, nil
	}

	labelIDs := make([]int64, 0, len(suggestions))
	labelIDSet := make(map[int64]bool)
	principalIDs := make([]int64, 0, len(suggestions))
	principalIDSet := make(map[int64]bool)
	for _, sugg := range suggestions {
		if !labelIDSet[sugg.LabelID] {
			labelIDs = append(labelIDs, sugg.LabelID)
			labelIDSet[sugg.LabelID] = true
		}
		if !principalIDSet[sugg.PrincipalID] {
			principalIDs = append(principalIDs, sugg.PrincipalID)
			principalIDSet[sugg.PrincipalID] = true
		}
	}

	labelInfosByID, err := s.labelStore.FindInfosByIDs(ctx, labelIDs)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find label infos: %w", err)
	}

	labelValueInfosByLabelID, err := s.labelValueStore.ListInfosByLabelIDs(ctx, labelIDs)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find label values: %w", err)
	}

	principalInfos, err := s.principalInfoCache.Map(ctx, principalIDs)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find principal infos: %w", err)
	}

	responses := make([]*types.PullReqLabelSuggestionResponse, 0, len(suggestions))
	for _, sugg := range suggestions {
		labelInfo := labelInfosByID[sugg.LabelID]
		if labelInfo == nil {
			continue
		}

		var labelValueInfo *types.LabelValueInfo
		if sugg.ValueID != nil && *sugg.ValueID > 0 {
			if valueInfos, exists := labelValueInfosByLabelID[sugg.LabelID]; exists {
				for _, vi := range valueInfos {
					if vi.ID != nil && *vi.ID == *sugg.ValueID {
						labelValueInfo = vi
						break
					}
				}
			}
		}

		responses = append(responses, &types.PullReqLabelSuggestionResponse{
			Label:       labelInfo,
			Value:       labelValueInfo,
			SuggestedBy: principalInfos[sugg.PrincipalID],
			Suggested:   sugg.CreatedAt,
		})
	}

	return responses, count, nil
}

// ApplySuggestion finds a pending label suggestion, assigns the label to the pull request,
// and removes the suggestion entry, all within a single transaction.
func (s *Service) ApplySuggestion(
	ctx context.Context,
	principalID int64,
	pullreqID int64,
	repoID int64,
	repoParentID int64,
	labelID int64,
) (*AssignToPullReqOut, error) {
	var out *AssignToPullReqOut
	err := s.tx.WithTx(ctx, func(ctx context.Context) error {
		suggestion, err := s.pullreqLabelSuggestionStore.Find(ctx, pullreqID, labelID)
		if err != nil {
			return fmt.Errorf("failed to find label suggestion: %w", err)
		}

		in := &types.PullReqLabelAssignInput{
			LabelID: labelID,
			ValueID: suggestion.ValueID,
		}

		out, err = s.AssignToPullReq(ctx, principalID, pullreqID, repoID, repoParentID, in)
		if err != nil {
			return fmt.Errorf("failed to assign pullreq label: %w", err)
		}

		if err = s.pullreqLabelSuggestionStore.Delete(ctx, pullreqID, labelID); err != nil {
			return fmt.Errorf("failed to delete label suggestions: %w", err)
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return out, nil
}
