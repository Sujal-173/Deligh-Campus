# Platform QA Report

Date: 22 September 2026

## Scope completed

- Audited the shared `Button` component and all authentication-form usages.
- Verified the Google sign-in component is used only by the login form and has a click handler.
- Checked the main role dashboard routes and the repaired admin/recruiter API flows in the local environment.
- Ran the frontend TypeScript check and the backend Spring test suite.

## Fixes made

1. Shared buttons now default to `type="button"`. This prevents an action button in a form from accidentally submitting the form. Intentional form submission remains explicit with `type="submit"`.
2. The social-login component now requires an `onGoogleClick` handler at compile time, so it cannot be rendered as an inert button by mistake.
3. Corrected the frontend registration endpoint to use the backend's `/auth/register` route.
4. Added the client directive required by the trainer view's stateful component.
5. Fixed PostgreSQL search binding in the admin users/courses and recruiter talent queries by passing a non-null string parameter. The affected endpoints now return successfully when search is omitted.
6. Enabled the test configuration to validate the PostgreSQL/Flyway-managed schema.
7. Removed the non-functional dashboard-wide search field until it can be backed by a defined search API. The responsive dashboard menu controls now explicitly use `type="button"`.
8. Fixed PostgreSQL 18 nullable-parameter failures in student course loading, student assessment filtering, institution student search, and trainer reports. Optional filters now use typed non-null values (or a null-capable parameter map where a UUID filter is optional).

## Validation results

| Check | Result |
| --- | --- |
| Frontend TypeScript (`npm run typecheck`) | Passed |
| Backend Spring test suite (`mvn test -q`) | Passed: 1 run, 0 failures, 0 errors |
| Backend health and ping endpoints | Passed locally |
| Registration and login through the frontend API boundary | Passed locally |
| Dashboard route availability (student, trainer, institution, recruiter, admin, super-admin) | Returned successfully in local route checks |
| Admin users/courses and recruiter talent APIs | Returned successfully after query fix |
| Protected dashboard route audit | 70 dashboard routes returned the expected login redirect when unauthenticated; no route produced a server error |
| Authenticated student render sweep | Passed: student root, dashboard, learning, assessment, career, notifications, and profile all rendered with no error panel |
| Authenticated dashboard roots | Passed: trainer, institution, recruiter, admin, and super-admin rendered with no error panel |

## Known limitations before production release

- Google OAuth is intentionally not configured. The visible Google button reports this state; it does not authenticate a user. Configure backend OAuth and provider credentials before enabling it for production.
- `npm run lint` currently fails with 41 errors and 9 warnings. The errors are chiefly missing stable React keys in `OperationsViews.tsx` and `StakeholderViews.tsx`, plus redundant empty interfaces in `types/stakeholder.ts`. Resolve these before enforcing a clean production CI gate; they have not been suppressed.
- The current backend test is a Spring context/schema validation test, not full end-to-end coverage of every role workflow. Add automated browser tests for role-specific create, edit, approval, upload, and logout workflows.
- Visual interaction and device-width verification could not be completed in this run because the local browser connection was unavailable. The shared dashboard shell was statically reviewed: it uses a mobile overlay menu, desktop sticky sidebar, responsive page padding, overflow-safe main content, accessible labels, and keyboard focus styles. This needs confirmation on real mobile and desktop viewports once browser automation is available.
- Do not run a production frontend build concurrently with the Next.js development server in the same checkout: both use `.next`. Build in clean CI or stop the development server first.
- Secrets remain in local `.env` files only and must be supplied through the deployment secret manager; do not commit them.

## Production release gate

The repaired flows are suitable for continued QA, but the application should not yet be described as fully production-ready until the lint failures are cleared, OAuth is deliberately configured or hidden, role workflows have end-to-end coverage, and production environment/secret handling is verified in CI.
