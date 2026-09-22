# Deligh Campus Spring Boot Backend

Spring Boot backend for the Deligh Campus learning, assessment, governance and talent-discovery platform.

## Runtime

- Spring Boot 4.x
- Java 21
- PostgreSQL
- Flyway migrations
- JWT authentication
- Spring Security role-based authorization
- REST API envelope: `{ success, message, data }`

## Stakeholder APIs

- `/api/v1/student/**`
- `/api/v1/trainer/**`
- `/api/v1/institution/**`
- `/api/v1/recruiter/**`
- `/api/v1/admin/**`
- `/api/v1/super-admin/**`

## New production integration

Institution and Recruiter controllers back the corresponding frontend workspaces. Institution reads are scoped to the authenticated user's organization. Recruiter operations are scoped to the authenticated recruiter.

Flyway `V4__create_recruiter_talent_schema.sql` creates job openings, applications and recruiter shortlists.

`PUT /api/v1/users/me` updates authenticated profile fields without allowing the browser to submit a replacement user id.

## Database setup

Configure the PostgreSQL connection using the project's Spring environment variables, then start the application so Flyway applies migrations in order.

## Verification

Run the Maven build and integration tests in the real development/staging environment before merge. The current sandbox did not have Maven dependencies available for a full Spring compile.
