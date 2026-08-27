ALTER TABLE spaces ADD COLUMN space_root_space_identifier TEXT;
ALTER TABLE repositories ADD COLUMN repo_root_space_identifier TEXT;
ALTER TABLE pullreqs ADD COLUMN pullreq_root_space_identifier TEXT;
ALTER TABLE usage_metrics ADD COLUMN usage_metric_space_identifier TEXT;

-- backfill spaces: copy the root space's identifier (space_uid) via the
-- already-resolved space_root_space_id populated in migration 0188.
UPDATE spaces
SET space_root_space_identifier = root.space_uid
FROM spaces root
WHERE root.space_id = spaces.space_root_space_id;

-- backfill repositories via their resolved root space.
UPDATE repositories
SET repo_root_space_identifier = root.space_uid
FROM spaces root
WHERE root.space_id = repositories.repo_root_space_id;

-- backfill pullreqs via their resolved root space.
UPDATE pullreqs
SET pullreq_root_space_identifier = root.space_uid
FROM spaces root
WHERE root.space_id = pullreqs.pullreq_root_space_id;

-- backfill usage_metrics: copy the identifier of the space it references.
UPDATE usage_metrics
SET usage_metric_space_identifier = s.space_uid
FROM spaces s
WHERE s.space_id = usage_metrics.usage_metric_space_id;

ALTER TABLE spaces ALTER COLUMN space_root_space_identifier SET NOT NULL;
ALTER TABLE repositories ALTER COLUMN repo_root_space_identifier SET NOT NULL;
ALTER TABLE pullreqs ALTER COLUMN pullreq_root_space_identifier SET NOT NULL;
ALTER TABLE usage_metrics ALTER COLUMN usage_metric_space_identifier SET NOT NULL;

-- the root space identifier columns above are unindexed and used only for
-- display, so the indices on the root space id columns (added in 0188) are
-- no longer needed by any query.
DROP INDEX pullreqs_root_space_id;
DROP INDEX repositories_root_space_id;
DROP INDEX spaces_root_space_id;
