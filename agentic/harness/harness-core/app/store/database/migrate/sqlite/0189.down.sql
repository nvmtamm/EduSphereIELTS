CREATE INDEX spaces_root_space_id ON spaces(space_root_space_id);
CREATE INDEX repositories_root_space_id ON repositories(repo_root_space_id);
CREATE INDEX pullreqs_root_space_id ON pullreqs(pullreq_root_space_id);

ALTER TABLE usage_metrics DROP COLUMN usage_metric_space_identifier;
ALTER TABLE pullreqs DROP COLUMN pullreq_root_space_identifier;
ALTER TABLE repositories DROP COLUMN repo_root_space_identifier;
ALTER TABLE spaces DROP COLUMN space_root_space_identifier;
