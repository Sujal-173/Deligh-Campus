# Deligh Campus Backend API - Fixed

## Root cause of the startup error

The application is using `spring.jpa.hibernate.ddl-auto=validate`. Hibernate therefore does
not create missing tables; it only checks that the database matches the JPA entities.

The startup log shows:

`Schema validation: missing table [roles]`

The project already contains Flyway V1 which defines `roles`, but the database being used by
the application does not currently contain that table (or its Flyway history is out of sync).

This version adds `V2__repair_identity_roles.sql`, an idempotent repair migration that creates
the `roles` table when it is missing and restores the six default roles.

## Recommended clean run

1. Make sure PostgreSQL is running.
2. Set these environment variables in IntelliJ:
   - DATABASE_URL=jdbc:postgresql://localhost:5432/Soft_Skill_Platform
   - DATABASE_USERNAME=<your PostgreSQL username>
   - DATABASE_PASSWORD=<your PostgreSQL password>
   - JWT_SECRET=<at least 32 characters>
3. Run Maven:
   `mvn clean spring-boot:run`
   or run `BackendApiApplication` from IntelliJ.
4. The API uses port 8081 by default.

## If Flyway history is already inconsistent

If the database is disposable/development-only, the cleanest solution is to recreate the
database/schema and start the application again. Do NOT drop a production database.

The V1 + V2 migrations will then create the identity schema and default roles from scratch.

## Test endpoints

GET `/api/ping`

GET `/actuator/health`

POST `/api/v1/auth/register`

Example register body:
{
  "fullName": "Parth Yadav",
  "email": "parth@example.com",
  "mobile": "9999999999",
  "password": "Password@123",
  "role": "STUDENT"
}

POST `/api/v1/auth/login`

Example login body:
{
  "email": "parth@example.com",
  "password": "Password@123"
}

Use the returned `accessToken` as:

`Authorization: Bearer <token>`

Then call:

GET `/api/v1/test/protected`

For a student token:

GET `/api/v1/student/dashboard`
