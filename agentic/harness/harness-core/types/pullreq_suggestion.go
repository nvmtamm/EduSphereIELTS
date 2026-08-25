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

package types

// PullReqLabelSuggestion represents a suggested label for a pull request.
type PullReqLabelSuggestion struct {
	PullReqID   int64  `json:"pullreq_id"`
	PrincipalID int64  `json:"principal_id"`
	LabelID     int64  `json:"label_id"`
	ValueID     *int64 `json:"value_id,omitempty"`
	CreatedAt   int64  `json:"created_at"`
}

// PullReqLabelSuggestionResponse is the response for a created label suggestion.
type PullReqLabelSuggestionResponse struct {
	Label       *LabelInfo      `json:"label"`
	Value       *LabelValueInfo `json:"value,omitempty"`
	SuggestedBy *PrincipalInfo  `json:"suggested_by"`
	Suggested   int64           `json:"suggested"`
}
