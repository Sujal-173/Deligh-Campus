# Production-readiness review

## Findings addressed

- Replaced browser `localStorage` and JavaScript-created auth cookies with a server-side session gateway using Secure, HttpOnly, SameSite cookies.
- Added a same-origin backend proxy so Spring Boot access tokens do not enter the client bundle or client state.
- Added signed role cookies and role-aware route middleware for Admin, Super Admin, Student, Trainer, Institution, and Recruiter areas.
- Added safe post-login redirect validation to prevent open redirects.
- Added request timeouts, upstream error handling, encoded dynamic endpoint segments, and restricted forwarded headers.
- Disabled mock data by default and made it impossible to enable in production.
- Removed the development login bypass from the login screen.
- Added baseline CSP and browser security headers.
- Added production environment validation for backend URL and role-signing secret.
- Added Admin and Super Admin route trees, centralized navigation, permission identifiers, responsive shells, and API-ready empty states without fabricated records or dashboard metrics.
- Applied Deligh Campus brand colors, BDO Grotesk assets, Inter/system fallback, Lucide icons, accessible focus states, reduced-motion handling, and responsive navigation.
- Replaced the conflicted README and documented deployment and Spring Boot integration.

## Architecture decisions

- PostgreSQL is not accessed by the frontend. Spring Boot is the only data authority.
- The browser calls `/api/backend/*`. Next.js route handlers attach the server-held access token before forwarding to `BACKEND_API_URL`.
- Middleware guards page entry using a signed role cookie. Spring Security must still enforce endpoint permissions, tenancy, ownership, and audit requirements.
- Public signup roles remain limited to Student, Trainer, Recruiter, and Institution. Admin roles must be provisioned through privileged backend workflows.
- Admin and Super Admin modules intentionally show no synthetic operational values while backend contracts and final dashboard designs are pending.

## Required deployment values

Use `.env.example` as the source of truth. Production must set at least:

- `BACKEND_API_URL`
- `ROLE_COOKIE_SECRET` (secure random value, at least 32 characters)

Keep `NEXT_PUBLIC_USE_MOCK_DATA=false` in production.

## Verification status

- All edited TypeScript/TSX files were formatted successfully; Prettier's parser found no syntax errors.
- Desktop (1440×900) and mobile (390×844) dashboard visual previews were rendered and manually inspected. No horizontal overflow or visible overlap was found.
- A full dependency install, typecheck, lint, build, and package audit could not run in the sandbox because external npm registry access was unavailable. Run `npm ci && npm run check && npm audit --omit=dev` in CI or an environment with registry access before deployment.

## Backend follow-up

- Confirm the login envelope documented in `README.md`.
- Refresh-token rotation and logout revocation are wired through HttpOnly cookies; Spring Boot must implement the documented contracts and persist only hashed/revocable refresh-token identifiers.
- Enforce permissions represented in `data/dashboardNav.ts` through Spring Security; the frontend identifiers are navigation metadata, not security policy.
- Same-origin `Origin`/`Referer` validation now protects BFF mutations in addition to SameSite cookies. For cross-origin production architectures, replace this with a reviewed CSRF-token strategy rather than broadening the allowlist.
- Add rate limits for login, password reset, verification resend, uploads, and administrative mutations at the gateway or Spring Boot layer.
