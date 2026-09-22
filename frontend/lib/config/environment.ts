import "server-only";

export const ENVIRONMENT = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  
  appEnvironment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT || "development",
  
  features: {
    socialLogin: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === "true",
    emailVerification: process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION === "true",
    forgotPassword: process.env.NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD === "true",
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    errorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === "true",
  },
  
  config: {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Deligh Campus",
    appTagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Built for Smarter Education.",
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com",
  },
} as const;