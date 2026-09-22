# Vision & Brand Alignment

Source materials reviewed for this implementation:

- `ITS_Deligh_Vision_Handbook(2).pdf` — Vision Handbook v1.0, June/July 2026 release material.
- `Brand Guideline v1.pdf` — Deligh Campus Brand Guidelines 1.01, 2026.
- `ITS_Deligh_Frontend_Backend_Internship_Engineering_Workflow.pdf` — Frontend & Backend Engineering Workflow v1.0, 07 September 2026.

## Product alignment

The dashboard architecture follows the handbook stakeholder model: Student, Trainer, Institution/College, Recruiter, Admin and platform-level Super Admin governance.

The key product journey is represented in the navigation and data flows as:

`Learning → Practice → Assessment → Verification → Certificate → Talent Profile → Recruitment`

Admin and Super Admin workspaces separate operational governance from platform-wide governance.

## Design alignment

The dashboard shell uses the supplied Deligh Campus brand direction:

- primary navy `#000052`
- secondary indigo `#6366F1`
- white surfaces
- success `#22C55E`
- error `#EF4444`
- supplied Deligh Campus logo assets
- supplied BDO Grotesk font assets
- existing Lucide icon set

No alternate logo effects, neon gradients, distorted marks or unrelated dashboard themes were introduced.

## Engineering alignment

The implementation keeps UI responsibilities on the frontend and business logic/security/database ownership on Spring Boot. API paths live in the centralized endpoint configuration and page components consume services rather than embedding request URLs.

Authentication and authorization remain server responsibilities. Institution tenant scope and recruiter ownership are derived from the authenticated account on the backend.
