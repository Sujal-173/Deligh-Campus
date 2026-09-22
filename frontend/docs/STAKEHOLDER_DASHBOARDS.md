# Deligh Campus — Stakeholder Dashboard Implementation

## Product basis

This implementation follows the uploaded ITS Deligh Vision Handbook, Brand Guidelines, and Frontend/Backend Engineering Workflow.

The stakeholder model implemented here is:

- Student: guided learning → practice → assessment → verification → certificate → talent profile.
- Trainer: teach → mentor → schedule → evaluate → feedback.
- Institution: structured employability programs → learners → trainers → batches → analytics → placements.
- Recruiter: verified talent discovery → shortlist → job openings → hiring pipeline → outcomes.
- Admin: centralized learning operations, quality, approvals, assessments, finance and reporting.
- Super Admin: platform-wide organizations, RBAC, administrators, subscriptions, analytics, configuration and audit.

## Routes

### Student

- `/student`
- `/student/dashboard`
- `/student/learning`
- `/student/assessment`
- `/student/assessment/[id]`
- `/student/career`
- `/student/profile`
- `/student/notifications`

### Trainer

- `/trainer/dashboard`
- `/trainer/batches`
- `/trainer/batches/new`
- `/trainer/batches/[id]`
- `/trainer/courses`
- `/trainer/courses/new`
- `/trainer/courses/[id]`
- `/trainer/live-classes`
- `/trainer/live-classes/new`
- `/trainer/students`
- `/trainer/students/[id]`
- `/trainer/assessments`
- `/trainer/assessments/new`
- `/trainer/assessments/[id]`
- `/trainer/sessions`
- `/trainer/attendance`
- `/trainer/feedback`
- `/trainer/announcements/new`
- `/trainer/reports`
- `/trainer/reports/[id]`
- `/trainer/profile`
- `/trainer/notifications`

### Institution

- `/institution/dashboard`
- `/institution/programs`
- `/institution/students`
- `/institution/trainers`
- `/institution/batches`
- `/institution/reports`
- `/institution/placements`
- `/institution/profile`
- `/institution/notifications`

### Recruiter

- `/recruiter/dashboard`
- `/recruiter/talent`
- `/recruiter/shortlists`
- `/recruiter/jobs`
- `/recruiter/pipeline`
- `/recruiter/reports`
- `/recruiter/profile`
- `/recruiter/notifications`

### Admin

- `/admin`
- `/admin/users`
- `/admin/courses`
- `/admin/batches`
- `/admin/course-approvals`
- `/admin/assessments`
- `/admin/appeals`
- `/admin/reports`
- `/admin/finance`
- `/admin/content`
- `/admin/settings`
- `/admin/profile`
- `/admin/notifications`

### Super Admin

- `/super-admin`
- `/super-admin/organizations`
- `/super-admin/roles`
- `/super-admin/admins`
- `/super-admin/subscriptions`
- `/super-admin/analytics`
- `/super-admin/system`
- `/super-admin/audit-logs`
- `/super-admin/platform`
- `/super-admin/profile`
- `/super-admin/notifications`

## API integration rule

Pages do not own business data. They consume typed service functions, and services consume the centralized `API_ENDPOINTS` map.

The runtime path is:

`Browser → Next.js API proxy → Nginx → Spring Boot → PostgreSQL`

Production API configuration remains environment-driven through `NEXT_PUBLIC_API_PROXY_PATH` on the browser side and `BACKEND_API_URL` on the server side.

## Institution API contract

- `GET /institution/dashboard`
- `GET /institution/programs`
- `POST /institution/programs`
- `GET /institution/programs/{id}`
- `PUT /institution/programs/{id}`
- `DELETE /institution/programs/{id}`
- `GET /institution/students`
- `GET /institution/trainers`
- `GET /institution/batches`
- `GET /institution/reports`
- `GET /institution/placements`
- `GET /institution/notifications`

Institution ownership is derived server-side from `users.organization_id` for the authenticated user. The browser never sends an arbitrary organization id for these workspace reads.

## Recruiter API contract

- `GET /recruiter/dashboard`
- `GET /recruiter/talent`
- `GET /recruiter/shortlists`
- `POST /recruiter/shortlists`
- `DELETE /recruiter/shortlists/{studentId}`
- `GET /recruiter/jobs`
- `POST /recruiter/jobs`
- `GET /recruiter/jobs/{id}`
- `PUT /recruiter/jobs/{id}`
- `GET /recruiter/pipeline`
- `PATCH /recruiter/pipeline/{id}`
- `GET /recruiter/reports`
- `GET /recruiter/notifications`

Recruiter ownership is derived from the authenticated JWT identity. Job and pipeline operations cannot target another recruiter’s records because the backend adds the authenticated recruiter condition to the SQL operations.

## Design system

- Primary navy: `#000052`
- Secondary indigo: `#6366F1`
- White: `#FFFFFF`
- Success: `#22C55E`
- Error: `#EF4444`
- Brand typography uses the project-provided BDO Grotesk assets.
- Icons use the existing Lucide icon set.
- Logo treatment uses the supplied Deligh Campus assets without distortion, gradients, strokes or shadows.

The dashboard shell is shared across all roles so spacing, focus states, navigation behavior, responsive layout and interaction patterns do not drift between workspaces.

## Data rules

No dashboard cards, tables, learner names, organizations, jobs, metrics, progress percentages or assessment results are fabricated in the role pages. The views render API values, including explicit empty and unconfigured states.

UI configuration such as route definitions, pipeline stage labels and labels for metrics is kept in code/configuration; mutable business data remains backend-owned.

## Validation state coverage

Role views include:

- loading state
- empty state
- API error state with retry
- mutation busy state
- form-level required-field checks where applicable
- success/error toasts for mutations
- responsive overflow handling for wide data tables
- authenticated role routing through the existing middleware

## Known scope boundary

The Vision Handbook places AI interview preparation and advanced AI-assisted analytics in a later product phase. The existing Student AI Chat control therefore remains visibly present but does not fabricate an AI service that is not part of the current backend contract.
