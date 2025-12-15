'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import Image from 'next/image';
import { DB_TABLES } from '@/services/Constants';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        if (
          session.user.email.includes('@admin') ||
          session.user.email.includes('@superadmin')
        ) {
          router.push('/admin');
        } else {
          router.push('/users');
        }
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Check if user is banned
      const { data: userData, error: profileError } = await supabase
        .from(DB_TABLES.USERS)
        .select('banned')
        .eq('email', data.user.email)
        .single();

      if (profileError) {
        toast.error('Could not fetch user profile.');
        return;
      }

      if (userData.banned) {
        await supabase.auth.signOut();
        toast.error(
          'Your account has been banned. Please contact support for more information.'
        );
        return;
      }

      // Check if user is admin or superadmin
      if (
        data.user.email.includes('@admin') ||
        data.user.email.includes('@superadmin')
      ) {
        toast.success('Welcome, Admin!');
        router.push('/admin');
      } else {
        toast.error('Access denied. Admin privileges required.');
        await supabase.auth.signOut();
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Google login failed');
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 group">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse" />
              <div className="relative w-full h-full bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Access
          </h1>
          <p className="text-gray-600">Sign in to access the admin panel</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-violet-500 transition-colors" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-violet-500 transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Only authorized administrators can access this panel
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Contact system administrator for access
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
