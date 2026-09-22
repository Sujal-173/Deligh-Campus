# Google OAuth and Email Verification Setup Guide

This guide explains how to configure Google OAuth authentication and email verification for the Deligh Campus application.

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Email Service Configuration](#email-service-configuration)
3. [Environment Variables](#environment-variables)
4. [Testing the Setup](#testing-the-setup)
5. [Troubleshooting](#troubleshooting)

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API or People API for user profile access

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the following:

**Authorized JavaScript origins:**
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- `https://yourdomain.com` (production)

**Authorized redirect URIs:**
- `http://localhost:3000/oauth2/callback` (development)
- `http://localhost:3001/oauth2/callback` (development)
- `https://yourdomain.com/oauth2/callback` (production)

5. Click **Create** and save the **Client ID** and **Client Secret**

### Step 3: Configure Application

Add the Google OAuth credentials to your backend environment:

```bash
# backend/.env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Add to your frontend environment:

```bash
# frontend/.env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Email Service Configuration

### Option 1: Gmail SMTP (Recommended for Development)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
3. Configure the backend environment:

```bash
# backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Option 2: SendGrid (Recommended for Production)

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com/)
2. Generate an API Key with "Mail Send" permissions
3. Configure the backend environment:

```bash
# backend/.env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Option 3: AWS SES (For Production)

1. Set up Amazon Simple Email Service
2. Verify your sending domain
3. Generate SMTP credentials
4. Configure the backend environment:

```bash
# backend/.env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-aws-smtp-username
SMTP_PASSWORD=your-aws-smtp-password
```

## Environment Variables

### Backend Configuration

Add these variables to `backend/.env`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

Add these variables to `frontend/.env`:

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true
NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=true
```

## Testing the Setup

### 1. Test Google OAuth

1. Restart the backend server
2. Restart the frontend server
3. Navigate to the login page
4. Click "Continue with Google"
5. You should be redirected to Google's OAuth consent screen
6. After authorization, you should be redirected back to the application

### 2. Test Email Verification

1. Register a new user account
2. Check your email for the verification link
3. Click the verification link
4. You should be automatically logged in with email verified

### 3. Test Email Resend

1. Use the resend verification endpoint
2. Check your email for the new verification link

## Troubleshooting

### Google OAuth Issues

**Issue: "redirect_uri_mismatch" error**
- Ensure the redirect URI in Google Console matches exactly what's in your frontend
- Check both http and https versions
- Include the port number for local development

**Issue: OAuth button not working**
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Check browser console for JavaScript errors
- Ensure social login feature flag is enabled

**Issue: User not created after OAuth**
- Check backend logs for OAuth processing errors
- Verify Google Client Secret is correct
- Ensure the OAuth success endpoint is accessible

### Email Verification Issues

**Issue: Verification emails not sending**
- Check SMTP credentials are correct
- Verify email service port (587 for TLS, 465 for SSL)
- Check firewall rules for SMTP traffic
- Review backend logs for email sending errors

**Issue: "Invalid or expired verification token"**
- Tokens expire after 24 hours
- Check the verification link format
- Ensure the frontend URL is configured correctly

**Issue: Gmail SMTP authentication failed**
- Use an App Password instead of your regular password
- Enable 2-factor authentication on your Google account
- Check if Google is blocking less secure apps

### Database Issues

**Issue: Email verification fields not found**
- Run Flyway migrations: `mvn flyway:migrate`
- Check that migration V6 was applied successfully
- Verify the `users` table has `verification_token` and `verification_token_expires_at` columns

## Security Considerations

1. **Never commit OAuth credentials** to version control
2. **Use different OAuth apps** for development and production
3. **Rotate secrets** regularly
4. **Monitor OAuth usage** in Google Cloud Console
5. **Use reputable email services** for production
6. **Implement rate limiting** for email sending
7. **Add email reputation monitoring**

## Production Deployment

### Google OAuth Production Setup

1. Create a separate OAuth client ID for production
2. Add your production domain to authorized origins
3. Enable Google Cloud audit logging
4. Set up consent screen with proper branding

### Email Service Production Setup

1. Use a dedicated transactional email service (SendGrid, AWS SES, etc.)
2. Set up SPF, DKIM, and DMARC records
3. Monitor email deliverability rates
4. Implement bounce and complaint handling
5. Set up email analytics and tracking

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Spring Security OAuth2 Guide](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

## Support

For issues related to:
- **Google OAuth**: Check Google Cloud Console support
- **Email Services**: Refer to your email service provider's documentation
- **Application-specific issues**: Check the application logs and contact development team