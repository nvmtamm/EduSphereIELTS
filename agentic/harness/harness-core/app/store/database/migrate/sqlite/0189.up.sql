ALTER TABLE spaces ADD COLUMN space_root_space_identifier TEXT;
ALTER TABLE repositories ADD COLUMN repo_root_space_identifier TEXT;
ALTER TABLE pullreqs ADD COLUMN pullreq_root_space_identifier TEXT;
ALTER TABLE usage_metrics ADD COLUMN usage_metric_space_identifier TEXT;

-- backfill spaces: copy the root space's identifier (space_uid) via the
-- already-resolved space_root_space_id populated in migration 0188.
UPDATE spaces
SET space_root_space_identifier = (
    SELECT root.space_uid FROM spaces root WHERE root.space_id = spaces.space_root_space_id
);

-- backfill repositories via their resolved root space.
UPDATE repositories
SET repo_root_space_identifier = (
    SELECT root.space_uid FROM spaces root WHERE root.space_id = repositories.repo_root_space_id
);

-- backfill pullreqs via their resolved root space.
UPDATE pullreqs
SET pullreq_root_space_identifier = (
    SELECT root.space_uid FROM spaces root WHERE root.space_id = pullreqs.pullreq_root_space_id
);

-- backfill usage_metrics: copy the identifier of the space it references.
UPDATE usage_metrics
SET usage_metric_space_identifier = (
    SELECT s.space_uid FROM spaces s WHERE s.space_id = usage_metrics.usage_metric_space_id
);

-- SQLite cannot add a NOT NULL column to a populated table, so recreate the
-- tables to enforce NOT NULL. Create all temp tables first so data can be
-- copied before any DROP: dropping spaces cascade-drops repositories and
-- pullreqs, so everything must be copied before the first DROP TABLE.

CREATE TABLE spaces_temp (
 space_id                    INTEGER PRIMARY KEY AUTOINCREMENT
,space_version               INTEGER NOT NULL DEFAULT 0
,space_parent_id             INTEGER DEFAULT NULL
,space_uid                   TEXT NOT NULL
,space_description           TEXT
,space_created_by            INTEGER NOT NULL
,space_created               BIGINT NOT NULL
,space_updated               BIGINT NOT NULL
,space_deleted               BIGINT DEFAULT NULL
,space_root_space_id         INTEGER NOT NULL
,space_root_space_identifier TEXT NOT NULL
,CONSTRAINT fk_space_parent_id FOREIGN KEY (space_parent_id)
    REFERENCES spaces (space_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
);

CREATE TABLE repositories_temp (
 repo_id                    INTEGER PRIMARY KEY AUTOINCREMENT
,repo_version               INTEGER NOT NULL DEFAULT 0
,repo_parent_id             INTEGER NOT NULL
,repo_uid                   TEXT NOT NULL
,repo_description           TEXT
,repo_created_by            INTEGER NOT NULL
,repo_created               BIGINT NOT NULL
,repo_updated               BIGINT NOT NULL
,repo_git_uid               TEXT NOT NULL
,repo_default_branch        TEXT NOT NULL
,repo_fork_id               INTEGER
,repo_pullreq_seq           INTEGER NOT NULL
,repo_num_forks             INTEGER NOT NULL
,repo_num_pulls             INTEGER NOT NULL
,repo_num_closed_pulls      INTEGER NOT NULL
,repo_num_open_pulls        INTEGER NOT NULL
,repo_num_merged_pulls      INTEGER NOT NULL
,repo_size                  INTEGER NOT NULL DEFAULT 0
,repo_size_updated          BIGINT NOT NULL DEFAULT 0
,repo_deleted               BIGINT DEFAULT NULL
,repo_is_empty              BOOLEAN NOT NULL DEFAULT false
,repo_state                 INTEGER DEFAULT 0
,repo_last_git_push         BIGINT NOT NULL DEFAULT 0
,repo_lfs_size              BIGINT NOT NULL DEFAULT 0
,repo_tags                  JSONB NOT NULL DEFAULT '{}'
,repo_type                  TEXT
,repo_language              TEXT DEFAULT ''
,repo_root_space_id         INTEGER NOT NULL
,repo_root_space_identifier TEXT NOT NULL
,UNIQUE(repo_git_uid)
,CONSTRAINT fk_repo_parent_id FOREIGN KEY (repo_parent_id)
    REFERENCES spaces (space_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
);

CREATE TABLE pullreqs_temp (
 pullreq_id                        INTEGER PRIMARY KEY AUTOINCREMENT
,pullreq_version                   INTEGER NOT NULL DEFAULT 0
,pullreq_created_by                INTEGER NOT NULL
,pullreq_created                   BIGINT NOT NULL
,pullreq_updated                   BIGINT NOT NULL
,pullreq_edited                    BIGINT NOT NULL
,pullreq_closed                    BIGINT
,pullreq_number                    INTEGER NOT NULL
,pullreq_state                     TEXT NOT NULL
,pullreq_substate                  TEXT NOT NULL DEFAULT ''
,pullreq_is_draft                  TEXT NOT NULL DEFAULT FALSE
,pullreq_comment_count             INTEGER NOT NULL DEFAULT 0
,pullreq_unresolved_count          INTEGER NOT NULL DEFAULT 0
,pullreq_title                     TEXT NOT NULL
,pullreq_description               TEXT NOT NULL
,pullreq_source_repo_id            INTEGER
,pullreq_source_branch             TEXT NOT NULL
,pullreq_source_sha                TEXT NOT NULL
,pullreq_target_repo_id            INTEGER NOT NULL
,pullreq_target_branch             TEXT NOT NULL
,pullreq_activity_seq              INTEGER NOT NULL DEFAULT 0
,pullreq_merged_by                 INTEGER
,pullreq_merged                    BIGINT
,pullreq_merge_method              TEXT
,pullreq_merge_check_status        TEXT NOT NULL DEFAULT 'unchecked'
,pullreq_merge_target_sha          TEXT
,pullreq_merge_base_sha            TEXT NOT NULL DEFAULT ''
,pullreq_merge_sha                 TEXT
,pullreq_merge_conflicts           TEXT
,pullreq_merge_violations_bypassed BOOLEAN DEFAULT NULL
,pullreq_rebase_check_status       TEXT NOT NULL DEFAULT 'unchecked'
,pullreq_rebase_conflicts          TEXT
,pullreq_commit_count              INTEGER
,pullreq_file_count                INTEGER
,pullreq_additions                 INTEGER
,pullreq_deletions                 INTEGER
,pullreq_type                      TEXT
,pullreq_root_space_id             INTEGER NOT NULL
,pullreq_root_space_identifier     TEXT NOT NULL
,CONSTRAINT fk_pullreq_created_by FOREIGN KEY (pullreq_created_by)
    REFERENCES principals (principal_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
,CONSTRAINT fk_pullreq_source_repo_id FOREIGN KEY (pullreq_source_repo_id)
    REFERENCES repositories (repo_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL
,CONSTRAINT fk_pullreq_target_repo_id FOREIGN KEY (pullreq_target_repo_id)
    REFERENCES repositories (repo_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
,CONSTRAINT fk_pullreq_merged_by FOREIGN KEY (pullreq_merged_by)
    REFERENCES principals (principal_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
);

CREATE TABLE usage_metrics_temp (
 usage_metric_space_id          BIGINT            NOT NULL
,usage_metric_date              BIGINT            NOT NULL
,usage_metric_created           BIGINT            NOT NULL
,usage_metric_updated           BIGINT
,usage_metric_bandwidth_out     BIGINT  DEFAULT 0 NOT NULL
,usage_metric_storage_total     BIGINT  DEFAULT 0 NOT NULL
,usage_metric_pushes            INTEGER DEFAULT 0 NOT NULL
,usage_metric_bandwidth_in      BIGINT  DEFAULT 0 NOT NULL
,usage_metric_lfs_storage_total BIGINT  DEFAULT 0 NOT NULL
,usage_metric_space_identifier  TEXT              NOT NULL
,CONSTRAINT pk_usage_metrics
    PRIMARY KEY (usage_metric_space_id, usage_metric_date)
,CONSTRAINT fk_usagemetric_space_id
    FOREIGN KEY (usage_metric_space_id)
    REFERENCES spaces (space_id)
    ON DELETE CASCADE
);

-- Copy all data while originals still exist.

INSERT INTO spaces_temp SELECT
 space_id
,space_version
,space_parent_id
,space_uid
,space_description
,space_created_by
,space_created
,space_updated
,space_deleted
,space_root_space_id
,space_root_space_identifier
FROM spaces;

INSERT INTO repositories_temp SELECT
 repo_id
,repo_version
,repo_parent_id
,repo_uid
,repo_description
,repo_created_by
,repo_created
,repo_updated
,repo_git_uid
,repo_default_branch
,repo_fork_id
,repo_pullreq_seq
,repo_num_forks
,repo_num_pulls
,repo_num_closed_pulls
,repo_num_open_pulls
,repo_num_merged_pulls
,repo_size
,repo_size_updated
,repo_deleted
,repo_is_empty
,repo_state
,repo_last_git_push
,repo_lfs_size
,repo_tags
,repo_type
,repo_language
,repo_root_space_id
,repo_root_space_identifier
FROM repositories;

INSERT INTO pullreqs_temp SELECT
 pullreq_id
,pullreq_version
,pullreq_created_by
,pullreq_created
,pullreq_updated
,pullreq_edited
,pullreq_closed
,pullreq_number
,pullreq_state
,pullreq_substate
,pullreq_is_draft
,pullreq_comment_count
,pullreq_unresolved_count
,pullreq_title
,pullreq_description
,pullreq_source_repo_id
,pullreq_source_branch
,pullreq_source_sha
,pullreq_target_repo_id
,pullreq_target_branch
,pullreq_activity_seq
,pullreq_merged_by
,pullreq_merged
,pullreq_merge_method
,pullreq_merge_check_status
,pullreq_merge_target_sha
,pullreq_merge_base_sha
,pullreq_merge_sha
,pullreq_merge_conflicts
,pullreq_merge_violations_bypassed
,pullreq_rebase_check_status
,pullreq_rebase_conflicts
,pullreq_commit_count
,pullreq_file_count
,pullreq_additions
,pullreq_deletions
,pullreq_type
,pullreq_root_space_id
,pullreq_root_space_identifier
FROM pullreqs;

INSERT INTO usage_metrics_temp SELECT
 usage_metric_space_id
,usage_metric_date
,usage_metric_created
,usage_metric_updated
,usage_metric_bandwidth_out
,usage_metric_storage_total
,usage_metric_pushes
,usage_metric_bandwidth_in
,usage_metric_lfs_storage_total
,usage_metric_space_identifier
FROM usage_metrics;

-- Drop originals in reverse FK order to avoid FK violations.
DROP TABLE usage_metrics;
DROP TABLE pullreqs;
DROP TABLE repositories;
DROP TABLE spaces;

-- Rename in forward FK order so each table exists before its dependents.
ALTER TABLE spaces_temp RENAME TO spaces;
ALTER TABLE repositories_temp RENAME TO repositories;
ALTER TABLE pullreqs_temp RENAME TO pullreqs;
ALTER TABLE usage_metrics_temp RENAME TO usage_metrics;

CREATE INDEX spaces_parent_id ON spaces(space_parent_id) WHERE space_deleted IS NULL;
CREATE INDEX spaces_deleted_parent_id ON spaces(space_deleted, space_parent_id) WHERE space_deleted IS NOT NULL;
CREATE INDEX idx_spaces_lower_space_uid ON spaces(LOWER(space_uid));

CREATE UNIQUE INDEX repositories_parent_id_uid
    ON repositories(repo_parent_id, LOWER(repo_uid))
    WHERE repo_deleted IS NULL;
CREATE INDEX repositories_deleted
    ON repositories(repo_deleted)
    WHERE repo_deleted IS NOT NULL;

CREATE UNIQUE INDEX pullreqs_target_repo_id_number
    ON pullreqs(pullreq_target_repo_id, pullreq_number);
CREATE UNIQUE INDEX pullreqs_source_repo_branch_target_repo_branch
    ON pullreqs(pullreq_source_repo_id, pullreq_source_branch, pullreq_target_repo_id, pullreq_target_branch)
    WHERE pullreq_state = 'open' AND pullreq_source_repo_id IS NOT NULL;
CREATE INDEX pullreqs_target_repo_branch
    ON pullreqs (pullreq_target_repo_id, pullreq_target_branch)
    WHERE pullreq_state NOT IN ('closed', 'merged');
