/**
 * Utilitaires pour l'authentification
 */

import type { User } from '@supabase/supabase-js';

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(user: User | null): user is User {
  return user !== null;
}

/**
 * Extrait le prénom depuis l'email
 * Utilisé en attendant la complétion du profil utilisateur
 */
export function getDisplayName(user: User): string {
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Utilisateur';
}

/**
 * Vérifie si l'email est valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
