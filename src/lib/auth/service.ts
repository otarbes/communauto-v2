import { createClient } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';

/**
 * Service d'authentification
 * Gère toutes les opérations liées à l'auth utilisateur
 */
export class AuthService {
  private supabase = createClient();

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthError(error.message);
    }

    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new AuthError(error.message);
    }

    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      throw new AuthError(error.message);
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    
    if (error) {
      throw new AuthError(error.message);
    }

    return user;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new AuthError(error.message);
    }
  }
}

export const authService = new AuthService();
