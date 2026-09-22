-- ============================================================
-- Deligh Campus - Identity & RBAC Foundation
-- Flyway Migration: V1
-- ============================================================

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),

    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
    id UUID PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    mobile VARCHAR(20),

    password_hash VARCHAR(255) NOT NULL,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    is_locked BOOLEAN NOT NULL DEFAULT FALSE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE user_roles (
    user_id UUID NOT NULL,

    role_id BIGINT NOT NULL,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);


-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_users_email
    ON users(email);

CREATE INDEX idx_users_mobile
    ON users(mobile);

CREATE INDEX idx_user_roles_role_id
    ON user_roles(role_id);


-- ============================================================
-- Default System Roles
-- ============================================================

INSERT INTO roles (code, name, description) VALUES

(
    'SUPER_ADMIN',
    'Super Admin',
    'Full platform administration access'
),

(
    'ADMIN',
    'Admin',
    'Platform administration access'
),

(
    'STUDENT',
    'Student',
    'Student access to learning and campus features'
),

(
    'TRAINER',
    'Trainer',
    'Trainer access to teaching and learning features'
),

(
    'RECRUITER',
    'Recruiter',
    'Recruiter access to recruitment features'
),

(
    'INSTITUTION',
    'Institution',
    'Institution management access'
);