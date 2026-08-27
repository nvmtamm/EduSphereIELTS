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

package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/harness/gitness/app/store"
	"github.com/harness/gitness/store/database"
	"github.com/harness/gitness/store/database/dbtx"
	"github.com/harness/gitness/types"

	"github.com/Masterminds/squirrel"
	"github.com/guregu/null"
	"github.com/jmoiron/sqlx"
)

var _ store.PullReqLabelSuggestionStore = (*pullReqLabelSuggestionStore)(nil)

func NewPullReqLabelSuggestionStore(db *sqlx.DB) store.PullReqLabelSuggestionStore {
	return &pullReqLabelSuggestionStore{
		db: db,
	}
}

type pullReqLabelSuggestionStore struct {
	db *sqlx.DB
}

type pullReqLabelSuggestion struct {
	PullReqID    int64    `db:"pullreq_label_suggestion_pullreq_id"`
	PrincipalID  int64    `db:"pullreq_label_suggestion_principal_id"`
	LabelID      int64    `db:"pullreq_label_suggestion_label_id"`
	LabelValueID null.Int `db:"pullreq_label_suggestion_label_value_id"`
	CreatedAt    int64    `db:"pullreq_label_suggestion_created_at"`
}

const (
	pullReqLabelSuggestionColumns = `
		pullreq_label_suggestion_pullreq_id
		,pullreq_label_suggestion_principal_id
		,pullreq_label_suggestion_label_id
		,pullreq_label_suggestion_label_value_id
		,pullreq_label_suggestion_created_at`
)

func (s *pullReqLabelSuggestionStore) CreateMany(
	ctx context.Context,
	suggestions []*types.PullReqLabelSuggestion,
) error {
	if len(suggestions) == 0 {
		return nil
	}

	db := dbtx.GetAccessor(ctx, s.db)
	now := time.Now().UnixMilli()

	stmt := database.Builder.
		Insert("pullreq_label_suggestions").
		Columns(pullReqLabelSuggestionColumns)

	for _, suggestion := range suggestions {
		stmt = stmt.Values(
			suggestion.PullReqID,
			suggestion.PrincipalID,
			suggestion.LabelID,
			null.IntFromPtr(suggestion.ValueID),
			now,
		)
	}

	stmt = stmt.Suffix(`
	ON CONFLICT (pullreq_label_suggestion_pullreq_id, pullreq_label_suggestion_label_id) DO UPDATE
		SET pullreq_label_suggestion_principal_id = EXCLUDED.pullreq_label_suggestion_principal_id,
		pullreq_label_suggestion_label_value_id = EXCLUDED.pullreq_label_suggestion_label_value_id,
		pullreq_label_suggestion_created_at = EXCLUDED.pullreq_label_suggestion_created_at
		WHERE COALESCE(pullreq_label_suggestions.pullreq_label_suggestion_label_value_id, -1)
		<> COALESCE(EXCLUDED.pullreq_label_suggestion_label_value_id, -1)`)

	query, args, err := stmt.ToSql()
	if err != nil {
		return database.ProcessSQLErrorf(ctx, err, "failed to convert query to sql")
	}

	if _, err = db.ExecContext(ctx, query, args...); err != nil {
		return database.ProcessSQLErrorf(ctx, err, "failed to create label suggestions")
	}

	return nil
}

func (s *pullReqLabelSuggestionStore) List(
	ctx context.Context,
	pullreqID int64,
	filter types.ListQueryFilter,
) ([]*types.PullReqLabelSuggestion, error) {
	stmt := database.Builder.
		Select(pullReqLabelSuggestionColumns).
		From("pullreq_label_suggestions").
		Where("pullreq_label_suggestion_pullreq_id = ?", pullreqID).
		OrderBy("pullreq_label_suggestion_created_at ASC").
		Limit(database.Limit(filter.Size)).
		Offset(database.Offset(filter.Page, filter.Size))

	sqlQuery, args, err := stmt.ToSql()
	if err != nil {
		return nil, database.ProcessSQLErrorf(ctx, err, "failed to convert query to sql")
	}

	db := dbtx.GetAccessor(ctx, s.db)

	var dst []*pullReqLabelSuggestion
	if err = db.SelectContext(ctx, &dst, sqlQuery, args...); err != nil {
		return nil, database.ProcessSQLErrorf(ctx, err, "failed to list label suggestions")
	}

	return mapPullReqLabelSuggestions(dst), nil
}

func (s *pullReqLabelSuggestionStore) Count(
	ctx context.Context,
	pullreqID int64,
) (int64, error) {
	stmt := database.Builder.
		Select("COUNT(*)").
		From("pullreq_label_suggestions").
		Where("pullreq_label_suggestion_pullreq_id = ?", pullreqID)

	sqlQuery, args, err := stmt.ToSql()
	if err != nil {
		return 0, database.ProcessSQLErrorf(ctx, err, "failed to convert query to sql")
	}

	db := dbtx.GetAccessor(ctx, s.db)

	var count int64
	if err = db.GetContext(ctx, &count, sqlQuery, args...); err != nil {
		return 0, database.ProcessSQLErrorf(ctx, err, "failed to count label suggestions")
	}

	return count, nil
}

func (s *pullReqLabelSuggestionStore) Find(
	ctx context.Context,
	pullreqID int64,
	labelID int64,
) (*types.PullReqLabelSuggestion, error) {
	db := dbtx.GetAccessor(ctx, s.db)
	var dst pullReqLabelSuggestion

	stmt := database.Builder.
		Select(pullReqLabelSuggestionColumns).
		From("pullreq_label_suggestions").
		Where(squirrel.Eq{
			"pullreq_label_suggestion_pullreq_id": pullreqID,
			"pullreq_label_suggestion_label_id":   labelID,
		})

	sqlQuery, args, err := stmt.ToSql()
	if err != nil {
		return nil, database.ProcessSQLErrorf(ctx, err, "failed to convert query to sql")
	}

	if err = db.GetContext(ctx, &dst, sqlQuery, args...); err != nil {
		return nil, database.ProcessSQLErrorf(ctx, err, "failed to find label suggestion")
	}

	return mapPullReqLabelSuggestion(&dst), nil
}

func (s *pullReqLabelSuggestionStore) Delete(
	ctx context.Context,
	pullreqID int64,
	labelID int64,
) error {
	db := dbtx.GetAccessor(ctx, s.db)

	stmt := database.Builder.
		Delete("pullreq_label_suggestions").
		Where(squirrel.Eq{
			"pullreq_label_suggestion_pullreq_id": pullreqID,
			"pullreq_label_suggestion_label_id":   labelID,
		})

	sqlQuery, args, err := stmt.ToSql()
	if err != nil {
		return database.ProcessSQLErrorf(ctx, err, "failed to convert query to sql")
	}

	result, err := db.ExecContext(ctx, sqlQuery, args...)
	if err != nil {
		return database.ProcessSQLErrorf(ctx, err, "failed to delete label suggestions")
	}

	count, err := result.RowsAffected()
	if err != nil {
		return database.ProcessSQLErrorf(ctx, err, "failed to get affected rows")
	}
	if count == 0 {
		return database.ProcessSQLErrorf(ctx, sql.ErrNoRows, "failed to delete label suggestion")
	}

	return nil
}

func mapPullReqLabelSuggestion(dst *pullReqLabelSuggestion) *types.PullReqLabelSuggestion {
	return &types.PullReqLabelSuggestion{
		PullReqID:   dst.PullReqID,
		PrincipalID: dst.PrincipalID,
		LabelID:     dst.LabelID,
		ValueID:     dst.LabelValueID.Ptr(),
		CreatedAt:   dst.CreatedAt,
	}
}

func mapPullReqLabelSuggestions(dst []*pullReqLabelSuggestion) []*types.PullReqLabelSuggestion {
	out := make([]*types.PullReqLabelSuggestion, len(dst))

	for i, row := range dst {
		out[i] = mapPullReqLabelSuggestion(row)
	}

	return out
}
