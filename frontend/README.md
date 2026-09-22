# Deligh Campus Frontend

Production-oriented Next.js frontend for the Deligh Campus soft-skills learning, assessment and talent-discovery platform.

The UI has been expanded across the complete stakeholder set represented by the supplied product vision and reference screens: Student, Trainer, Institution, Recruiter, Admin and Super Admin.

## Stack

- Next.js App Router
- React + TypeScript
- Zustand
- Axios
- React Hook Form + Zod
- Tailwind CSS
- Spring Boot API through a same-origin Next.js BFF proxy
- PostgreSQL behind Spring Boot

## Workspaces

- Student: learning, assessments, career, profile, notifications
- Trainer: batches, courses, live classes, students, assessments, attendance, feedback, reports
- Institution: programs, students, trainers, batches, reports, placements
- Recruiter: verified talent, shortlists, jobs, hiring pipeline, reports
- Admin: users, courses, batches, approvals, assessments, appeals, reports, finance, content, settings
- Super Admin: organizations, roles/permissions, admins, subscriptions, analytics, system, audit logs, platform configuration

## Data contract

Business values are loaded from the backend. Dashboard components do not contain mock learner records, fabricated metrics, organization names, job records or assessment results.

Mutable API paths are centralized in `lib/config/shared.ts` and consumed through the service layer. Production API proxy behavior is environment-driven; no production endpoint is embedded inside dashboard components.

## Configuration

Copy `.env.example` to `.env.local` and configure the server-side backend URL, cookie secrets and runtime settings.

The browser talks to `/api/backend/*`; the Next.js proxy forwards the authenticated request to Spring Boot. PostgreSQL is never accessed from the browser.

## Commands

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run check
```

## Documentation

- `docs/VISION_ALIGNMENT.md` — source alignment and product/design principles
- `docs/STAKEHOLDER_DASHBOARDS.md` — route matrix, role flows, API contracts and data rules
- `BACKEND_INTEGRATION.md` — frontend/backend integration notes
- `PRODUCTION_READINESS.md` — deployment and security checklist
