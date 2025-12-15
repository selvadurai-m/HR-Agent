'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/provider';
import { useRouter, usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';

function AdminLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    (async () => {
      console.log('Admin Layout - Current user:', user);
      console.log('Admin Layout - User email:', user?.email);
      console.log('Admin Layout - Current path:', pathname);

      // If we're on the login page, don't check authentication
      if (pathname === '/admin/login') {
        setIsChecking(false);
        return;
      }

      // If user is still loading (undefined), wait
      if (user === undefined) {
        setIsChecking(true);
        return;
      }

      // If user is not logged in, redirect to login
      if (!user) {
        console.log('Admin Layout - No user found, redirecting to admin login');
        router.push('/admin/login');
        return;
      }

      // Check if user is banned
      if (user.banned) {
        console.log('Admin Layout - User is banned, signing out');
        supabase.auth.signOut();
        toast.error(
          'Your account has been banned. Please contact support for more information.'
        );
        router.push('/admin/login');
        return;
      }

      // Check if user email contains @admin
      console.log('Admin Layout - Checking if', user.email, 'contains @admin');

      if (
        !user.email.includes('@admin') &&
        !user.email.includes('@superadmin')
      ) {
        console.log(
          'Admin Layout - User not admin or superadmin, redirecting to dashboard'
        );
        router.push('/users');
        return;
      }

      console.log('Admin Layout - User is admin, allowing access');
      setIsChecking(false);
    })();
  }, [user, router, pathname]);

  // If we're on the login page, render without admin layout
  if (pathname === '/admin/login') {
    return children;
  }

  if (user === undefined || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-violet-100 via-white to-purple-100">
        <div className="flex flex-col items-center gap-6 p-10 rounded-2xl shadow-lg bg-white/80 border border-violet-100">
          <Shield className="w-16 h-16 text-violet-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-violet-700">
            Loading Admin Panel...
          </h2>
          <p className="text-gray-500">
            Please wait while we verify your access.
          </p>
          <div className="w-32 h-2 bg-violet-100 rounded-full overflow-hidden">
            <div className="h-2 bg-violet-500 animate-pulse rounded-full w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Modern Admin Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-violet-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-violet-50 px-3 py-1.5 rounded-full">
                Welcome,{' '}
                <span className="font-semibold text-violet-600">
                  {user?.name || 'Admin'}
                </span>
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="text-sm text-gray-500 hover:text-white px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm shadow-sm border-b border-violet-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-3">
            <Link
              href="/admin"
              className={`text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-300 ${
                pathname === '/admin'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className={`text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-300 ${
                pathname === '/admin/users'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
              }`}
            >
              Users
            </Link>
            <Link
              href="/admin/interviews"
              className={`text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-300 ${
                pathname === '/admin/interviews'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
              }`}
            >
              Interviews
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
