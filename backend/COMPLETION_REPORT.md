# Deligh Campus Backend — Stakeholder Integration Report

## Added

- Institution REST controller at `/api/v1/institution`.
- Recruiter REST controller at `/api/v1/recruiter`.
- Recruiter talent schema Flyway migration `V4__create_recruiter_talent_schema.sql`.
- Authenticated profile update support at `PUT /api/v1/users/me`.
- Institution organization-missing state returned as a controlled `422` API error for non-dashboard routes.

## Security

- `/api/v1/institution/**` requires `ROLE_INSTITUTION`.
- `/api/v1/recruiter/**` requires `ROLE_RECRUITER`.
- Organization and recruiter ownership is derived from the authenticated principal rather than trusting arbitrary ids from the browser.
- Existing `/api/v1/admin/**` and `/api/v1/super-admin/**` role gates remain intact.

## Database

Uses PostgreSQL and Flyway following the existing project migration architecture.

## Validation limitation

Maven was not available locally and the wrapper dependency download could not complete in the execution environment. New controller source was checked with `javac -proc:none`; no syntax-level diagnostics were detected, while external Spring dependency classes were unavailable for a full compile.
