'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/shared/constants';

/**
 * Server Actions pour l'authentification
 */

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/auth/login?error=Invalid credentials');
  }

  redirect(ROUTES.DASHBOARD);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/auth/register?error=Could not authenticate user');
  }

  redirect('/auth/login?message=Check your email to confirm your account');
}

export async function logout() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error during logout:', error.message);
  }
  
  redirect(ROUTES.AUTH.LOGIN);
}
