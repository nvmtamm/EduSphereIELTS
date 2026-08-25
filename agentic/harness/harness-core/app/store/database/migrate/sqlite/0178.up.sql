CREATE TABLE pullreq_label_suggestions (
    pullreq_label_suggestion_pullreq_id INTEGER NOT NULL,
    pullreq_label_suggestion_principal_id INTEGER NOT NULL,
    pullreq_label_suggestion_label_id INTEGER NOT NULL,
    pullreq_label_suggestion_label_value_id INTEGER,
    pullreq_label_suggestion_created_at BIGINT NOT NULL,

    PRIMARY KEY (pullreq_label_suggestion_pullreq_id, pullreq_label_suggestion_label_id),

    CONSTRAINT fk_pullreq_label_suggestions_pullreq_id FOREIGN KEY (pullreq_label_suggestion_pullreq_id)
        REFERENCES pullreqs (pullreq_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pullreq_label_suggestions_principal_id FOREIGN KEY (pullreq_label_suggestion_principal_id)
        REFERENCES principals (principal_id),
    CONSTRAINT fk_pullreq_label_suggestions_label_id FOREIGN KEY (pullreq_label_suggestion_label_id)
        REFERENCES labels (label_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pullreq_label_suggestions_label_value_id FOREIGN KEY (pullreq_label_suggestion_label_value_id)
        REFERENCES label_values (label_value_id)
        ON DELETE CASCADE
);
