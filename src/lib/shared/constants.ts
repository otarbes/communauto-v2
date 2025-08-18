// Constantes globales partagées

export const APP_NAME = 'Communauto CC';
export const APP_VERSION = '1.0.0';

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
} as const;
