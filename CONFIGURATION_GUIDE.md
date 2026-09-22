# Production-Ready Configuration Guide

## Environment Variables

### Backend (Spring Boot)

#### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `JWT_EXPIRATION` - JWT token expiration in milliseconds

#### Optional Variables
- `SERVER_PORT` - Server port (default: 8081)
- `APP_NAME` - Application name (default: Deligh Campus API)
- `APP_VERSION` - Application version (default: 1.0.0)
- `APP_ENVIRONMENT` - Environment (development/staging/production)
- `DB_CONNECTION_POOL_SIZE` - Database connection pool size (default: 10)
- `DB_CONNECTION_TIMEOUT_MS` - Database connection timeout (default: 30000)
- `SESSION_TIMEOUT_MS` - Session timeout in milliseconds (default: 1800000)
- `JPA_SHOW_SQL` - Show SQL queries (default: false)
- `JPA_FORMAT_SQL` - Format SQL queries (default: true)
- `CORS_ALLOWED_ORIGINS` - Comma-separated allowed origins
- `CORS_ALLOWED_METHODS` - Comma-separated allowed methods
- `CORS_ALLOWED_HEADERS` - Comma-separated allowed headers
- `CORS_ALLOW_CREDENTIALS` - Allow credentials (default: true)

### Frontend (Next.js)

#### Required Variables
- `BACKEND_API_URL` - Backend API base URL
- `ROLE_COOKIE_SECRET` - Cookie signing secret (min 32 characters)

#### Optional Variables
- `BACKEND_REQUEST_TIMEOUT_MS` - API request timeout (default: 15000)
- `SESSION_COOKIE_NAME` - Session cookie name (default: deligh_session)
- `REFRESH_COOKIE_NAME` - Refresh cookie name (default: deligh_refresh)
- `ROLE_COOKIE_NAME` - Role cookie name (default: deligh_role)
- `SESSION_REMEMBER_MAX_AGE_SECONDS` - Session max age (default: 604800)
- `NEXT_PUBLIC_APP_NAME` - Application name (default: Deligh Campus)
- `NEXT_PUBLIC_APP_TAGLINE` - Application tagline
- `NEXT_PUBLIC_SUPPORT_EMAIL` - Support email
- `NEXT_PUBLIC_API_PROXY_PATH` - API proxy path (default: /api/backend)
- `NEXT_PUBLIC_API_TIMEOUT_MS` - API timeout (default: 15000)
- `NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN` - Enable social login (default: false)
- `NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION` - Enable email verification (default: true)
- `NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD` - Enable forgot password (default: true)
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics (default: false)
- `NEXT_PUBLIC_ENABLE_ERROR_REPORTING` - Enable error reporting (default: false)

## Configuration Files

### Backend
- `backend/.env` - Development environment variables
- `backend/.env.production` - Production environment variables template
- `backend/src/main/resources/application.yaml` - Spring Boot configuration

### Frontend
- `frontend/.env` - Development environment variables
- `frontend/.env.production` - Production environment variables template

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong secrets** (minimum 32 characters for JWT and cookie secrets)
3. **Use environment-specific** configurations
4. **Enable HTTPS** in production
5. **Set appropriate CORS** origins for production
6. **Use connection pooling** for database connections
7. **Enable SQL logging** only in development
8. **Disable detailed error messages** in production

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure production database
- [ ] Generate secure JWT and cookie secrets
- [ ] Set appropriate CORS origins
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test configuration validation
- [ ] Verify error handling
- [ ] Test all API endpoints

## Configuration Validation

The application validates:
- Required environment variables in production
- Secret key lengths (minimum 32 characters)
- Numeric configuration values
- Database connectivity
- JWT token generation

## Monitoring

### Health Endpoints
- `/actuator/health` - Application health check
- `/actuator/info` - Application information

### Logging
- Development: DEBUG level with SQL logging
- Production: WARN level with minimal logging
- Logs include timestamp, thread, level, logger, and message