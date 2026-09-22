-- Recruiter/talent workflows for the Deligh Campus employability ecosystem.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS job_openings (
    id UUID PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(220) NOT NULL,
    description TEXT,
    location VARCHAR(180),
    openings INT NOT NULL DEFAULT 1 CHECK (openings > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'applied',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, student_id)
);

CREATE TABLE IF NOT EXISTS recruiter_shortlists (
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (recruiter_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_job_openings_recruiter ON job_openings(recruiter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON job_applications(job_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_student ON job_applications(student_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiter_shortlists_recruiter ON recruiter_shortlists(recruiter_id, created_at DESC);
