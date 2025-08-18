import type { User } from '@supabase/supabase-js';

/**
 * Types liés à l'authentification
 */

export interface AuthUser extends User {
  // Extensions du type User de Supabase si nécessaire
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword?: string;
}

export interface ResetPasswordData {
  email: string;
}

// Types pour les erreurs d'authentification
export type AuthErrorType = 
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_already_exists'
  | 'weak_password'
  | 'network_error'
  | 'unknown_error';

export interface AuthError {
  type: AuthErrorType;
  message: string;
}
