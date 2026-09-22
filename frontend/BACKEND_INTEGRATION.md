# Backend integration guide

The browser never calls Spring Boot directly. It calls the same-origin Next.js BFF at `/api/backend/*`; the BFF attaches the HttpOnly access-token cookie and sends the request to the server URL below.

## 1. Configure the connection

1. Copy `.env.example` to `.env.local` for local development. Do not commit `.env.local`.
2. Set the one backend connection point:

   ```env
   BACKEND_API_URL=http://localhost:8081/api/v1
   ```

   Do not add a trailing slash. For a deployed API, use its private/internal HTTPS URL where possible, for example `https://api.example.com/api/v1`.
3. Generate a unique role-cookie secret and set it in the deployment environment. PowerShell example:

   ```powershell
   $bytes = New-Object byte[] 32
   [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
   [Convert]::ToBase64String($bytes)
   ```

   Put the generated value in `ROLE_COOKIE_SECRET`. It must be at least 32 characters; it is server-only and must never use the `NEXT_PUBLIC_` prefix.
4. Set `NODE_ENV=production` in production, then run `npm run check`. The application uses Secure, HttpOnly, SameSite=Lax cookies in production.

## 2. Implement the authentication contract

All Spring Boot responses consumed by the frontend use this envelope:

```json
{ "success": true, "data": {} }
```

Errors should use `{ "success": false, "message": "Safe user-facing message" }` and the appropriate HTTP status.

| Purpose | Spring Boot endpoint | Request / required response data |
| --- | --- | --- |
| Login | `POST /auth/login` | Request: `email`, `password`. Response data: `accessToken`, optional `refreshToken`, `userId`, `fullName`, `email`, `roles: string[]`. |
| Current user | `GET /users/me` | Bearer access token. Return the authenticated user only. |
| Refresh | `POST /auth/refresh` | Request: `refreshToken`. Return data with a rotated `accessToken` and, ideally, rotated `refreshToken`. |
| Logout | `POST /auth/logout` | Request: `refreshToken`. Revoke it server-side. |
| Signup | `POST /auth/signup` | `fullName`, `email`, `mobile`, `password`, and one public role: `student`, `trainer`, `recruiter`, or `institution`. |

The Next.js routes `/api/auth/session`, `/api/auth/register`, and `/api/auth/logout` are the only browser-facing auth routes. They set or clear cookies; Spring Boot must never expect the browser to receive a JWT.

On every protected backend endpoint, Spring Security must validate the JWT and derive user id, roles, organization, and ownership from its authentication context. Never accept them as client-controlled request fields. Store refresh tokens as revocable, hashed records and rotate them on use.

## 3. Student dashboard contract

After a student signs in, the browser opens `/student/dashboard`. The server renders it through these BFF calls:

| Frontend BFF request | Spring Boot endpoint | Required data |
| --- | --- | --- |
| `GET /api/backend/student/dashboard` | `GET /student/dashboard` | `welcomeName`, `weekProgressPercent` (0–100), `summaryCards`, `topPerformers`, `rankList` |
| `GET /api/backend/student/schedule` | `GET /student/schedule` | Array of `id`, `title`, `trainerName`, ISO `startsAt`, `durationMinutes` |
| `GET /api/backend/student/notifications` | `GET /student/notifications` | Array of notification records including `id`, `title`, `body`, `createdAt`, `read` |

`summaryCards` use one of these icon values: `learning`, `classes`, `assessment`, `activity`, `achievements`, or `recommended`, and each `href` must be a local student path (for example `/student/learning`). `topPerformers.rank` is `1`, `2`, or `3`. Return empty arrays rather than fabricated data when there is no data.

The remaining student endpoints are already wired in `lib/config/shared.ts`: courses, assessment detail/start/submit, career, notifications, and profile. Add their Spring Boot controllers with the exact paths declared there.

## 4. Trainer dashboard contract

After a trainer signs in, `/trainer/dashboard` makes one request:

| Frontend BFF request | Spring Boot endpoint | Required data |
| --- | --- | --- |
| `GET /api/backend/trainer/dashboard` | `GET /trainer/dashboard` | `welcomeName`, `todaySchedule`, `upcomingClasses`, `studentMetrics`, `assessmentMetrics`, `recentActivities` |

Each schedule entry needs `id`, `title`, `batchName`, ISO `startsAt`, and status `active`, `inactive`, `scheduled`, `live`, `completed`, or `grading`. A metric needs `id`, `label`, `value`, with optional `trend` and `helperText`. Each activity needs `id`, `actorName`, `description`, and ISO `occurredAt`.

Trainer pages are wired to these backend prefixes: `/trainer/batches`, `/trainer/courses`, `/trainer/live-classes`, `/trainer/students`, `/trainer/assessments`, `/trainer/reports`, `/trainer/sessions`, `/trainer/feedback`, `/trainer/profile`, and `/trainer/notifications`. Pagination responses for batches, courses, and sessions must return `{ "items": [], "total": 0, "page": 0, "size": 20 }` inside `data`.

## 5. Security and deployment checks

1. Allow requests from Next.js to Spring Boot only at the network layer; the browser does not need direct CORS access to Spring Boot.
2. Use HTTPS end to end in production. Keep `BACKEND_API_URL` and every secret server-only.
3. Configure Spring Security authorization for every endpoint. The frontend route guard improves UX only; it is not authorization.
4. Rate-limit login, signup, password reset, refresh, and file-upload endpoints in Spring Boot or an API gateway.
5. Validate request DTOs on the backend, limit upload/body sizes, log security events without tokens or passwords, and return generic authentication errors.
6. Test: login as a student and trainer, refresh an expired access token, open another role's URL, logout, then confirm the old refresh token cannot be reused.

`app/api/backend/[...path]/route.ts` is the protected proxy implementation. It only forwards to `BACKEND_API_URL`, sends the access token as `Authorization: Bearer ...`, checks same-origin mutations, limits request bodies to 50 MiB, and retries once after a successful refresh. This is the file to extend if a backend-specific header or a new approved integration is required.
