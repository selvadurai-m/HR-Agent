import { supabase } from '@/services/supabaseClient';
import { logger } from '@/lib/logger';

/**
 * Sign in with Google OAuth
 * @param {string} [redirectPath] - Optional path to redirect after auth (defaults to /auth/callback)
 * @returns {Promise<{error: Error | null}>}
 */
export async function signInWithGoogle(redirectPath = '/auth/callback') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}${redirectPath}`,
    },
  });

  if (error) {
    logger.error('Google sign-in error:', error.message);
  }

  return { error };
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Error | null}>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.error('Sign out error:', error.message);
  }

  return { error };
}

/**
 * Get the current session
 * @returns {Promise<{session: Session | null, error: Error | null}>}
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  return { session: data?.session ?? null, error };
}

/**
 * Get the current user
 * @returns {Promise<{user: User | null, error: Error | null}>}
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  return { user: data?.user ?? null, error };
}
