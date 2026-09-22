-- Repair migration for databases where V1 was recorded but roles was removed.
-- Safe on a fresh database because all statements are idempotent.

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (code, name, description)
VALUES
 ('SUPER_ADMIN', 'Super Admin', 'Full platform administration access'),
 ('ADMIN', 'Admin', 'Platform administration access'),
 ('STUDENT', 'Student', 'Student access to learning and campus features'),
 ('TRAINER', 'Trainer', 'Trainer access to teaching and learning features'),
 ('RECRUITER', 'Recruiter', 'Recruiter access to recruitment features'),
 ('INSTITUTION', 'Institution', 'Institution management access')
ON CONFLICT (code) DO NOTHING;
