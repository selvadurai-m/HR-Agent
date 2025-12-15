'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { DB_TABLES } from '@/services/Constants';
import { logger } from '@/lib/logger';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        toast.error('Failed to complete sign in');
        logger.error('Session error:', error);
        setLoading(false);
        return;
      }

      const user = session.user;
      const email = user.email;

      // 1. Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from(DB_TABLES.USERS)
        .select('id, role, banned')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Not found is ok
        toast.error('Error fetching user profile: ' + fetchError.message);
        logger.error('Fetch error:', fetchError);
        setLoading(false);
        return;
      }

      // Check if user is banned
      if (existingUser && existingUser.banned) {
        await supabase.auth.signOut();
        toast.error(
          'Your account has been banned. Please contact support for more information.'
        );
        router.push('/login');
        setLoading(false);
        return;
      }

      let finalRole = 'candidate';

      if (!existingUser) {
        const savedRole = localStorage.getItem('pending_role') || 'candidate';
        finalRole = savedRole;

        const { error: insertError } = await supabase
          .from(DB_TABLES.USERS)
          .insert([
            {
              email: user.email,
              name: user.user_metadata?.full_name || 'No Name',
              role: savedRole,
            },
          ]);

        if (insertError) {
          // If duplicate key error, just continue as if user exists
          if (
            insertError.code === '23505' || // Postgres unique violation
            (insertError.message &&
              insertError.message.includes('duplicate key'))
          ) {
            // User already exists, fetch their role
            const { data: userRow } = await supabase
              .from(DB_TABLES.USERS)
              .select('role')
              .eq('email', user.email)
              .single();
            if (userRow) {
              finalRole = userRow.role;
            }
            // Continue to dashboard
          } else {
            toast.error(
              'Failed to create user profile: ' + insertError.message
            );
            logger.error('Insert error:', insertError);
            setLoading(false);
            return;
          }
        } else {
          toast.success('Profile created successfully.');
        }
      } else if (existingUser) {
        finalRole = existingUser.role;
      }

      localStorage.removeItem('pending_role');

      setLoading(false);
      if (finalRole === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }
    };

    handleAuthRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="text-center p-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-violet-100/50 animate-fade-in">
          <div className="relative mx-auto mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur opacity-30 animate-pulse" />
            <div className="relative animate-spin rounded-full h-14 w-14 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Finalizing Google login, please wait...
          </p>
          <p className="text-gray-400 text-sm mt-2">Setting up your account</p>
        </div>
      </div>
    );
  }
  return null;
}
