# Deployment

This project is prepared for a split deployment:

- Spring Boot and PostgreSQL on Render using `render.yaml`
- Next.js on Vercel from the `frontend` directory

## 1. Deploy Backend

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render will create the `deligh-campus-api` web service and PostgreSQL database.
4. Set these backend environment variables in Render:

```text
DATABASE_URL=jdbc:postgresql://<internal-db-host>:5432/deligh_campus
CORS_ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-mailbox@example.com
SMTP_PASSWORD=your-provider-app-password
```

Use the database host shown in Render's internal connection details. The `jdbc:postgresql://` prefix is required by Spring Boot.

The backend URL will be similar to:

```text
https://deligh-campus-api.onrender.com
```

Verify it at `/actuator/health` before deploying the frontend.

## 2. Deploy Frontend

1. In Vercel, import the same repository.
2. Set the project root to `frontend`.
3. Use the default Next.js build settings.
4. Configure these environment variables:

```text
BACKEND_API_URL=https://deligh-campus-api.onrender.com/api/v1
ROLE_COOKIE_SECRET=<at-least-32-random-characters>
BACKEND_REQUEST_TIMEOUT_MS=15000
NEXT_PUBLIC_API_PROXY_PATH=/api/backend
NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=true
NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD=true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=false
```

Set the same Vercel URL in Render as `CORS_ALLOWED_ORIGINS`, then redeploy the backend.

## 3. Smoke Test

Check these flows after both deployments:

1. Register a student account.
2. Verify the email link.
3. Complete the profile.
4. Log in and open `/student`.
5. Log in with each role in `test_users.md`.
6. Confirm `/actuator/health` reports the backend as healthy.

Do not copy local `.env` credentials into a hosted environment. Use provider secrets and a dedicated production mailbox.
