DROP TABLE repo_activities;

CREATE TABLE repo_activities (
 repo_activity_key TEXT PRIMARY KEY
,repo_activity_repo_id INTEGER NOT NULL
,repo_activity_principal_id INTEGER NOT NULL
,repo_activity_type TEXT NOT NULL
,repo_activity_payload JSONB NOT NULL DEFAULT '{}'::jsonb
,repo_activity_created BIGINT NOT NULL
,CONSTRAINT fk_repo_activities_repo_id FOREIGN KEY (repo_activity_repo_id)
    REFERENCES repositories (repo_id)
    ON UPDATE NO ACTION
    ON DELETE CASCADE
,CONSTRAINT fk_repo_activities_principal_id FOREIGN KEY (repo_activity_principal_id)
    REFERENCES principals (principal_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
);

CREATE INDEX repo_activities_repo_id_created_idx
    ON repo_activities (repo_activity_repo_id, repo_activity_created, repo_activity_type);
