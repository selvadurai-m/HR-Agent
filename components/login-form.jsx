'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { UserAuth } from '@/context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { signInWithGoogle } from '@/lib/auth';
import { logger } from '@/lib/logger';

export function LoginForm(props) {
  const { className, ...rest } = props;
  const router = useRouter();
  const { signInUser } = UserAuth();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const handleStartRecruiting = () => {
    router.push('/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = emailRef.current?.value?.trim().toLowerCase() || '';
    const password = passwordRef.current?.value || '';

    if (!email || !password) {
      toast.error('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { success, error } = await signInUser(email, password);

      if (!success) {
        toast.error(error || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }
      // Success toast is handled by AuthContext
    } catch (err) {
      logger.error('Unexpected error:', err);
      toast.error('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // with google
  const handleGoogleSignIn = async () => {
    // Check if there's a returnUrl in the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');

    // Pass returnUrl to auth callback if it exists
    const callbackPath = returnUrl
      ? `/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/auth/callback';

    const { error } = await signInWithGoogle(callbackPath);

    if (error) {
      toast.error('Google login failed: ' + error.message);
    }
    // Success toast is handled by auth callback
  };

  return (
    <>
      <form
        className={cn('flex flex-col gap-6', className)}
        {...rest}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Login to your account
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-violet-500 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                required
                ref={emailRef}
                className="pl-10 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid gap-2">
            {/* Password Label + Forgot Password Link */}
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>

            {/* Password Input with Lock Icon */}
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-violet-500 transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                ref={passwordRef}
                className="pl-10 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 transition-all duration-200 cursor-pointer shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      </form>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 cursor-pointer border-2 border-gray-200 hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200"
          onClick={handleGoogleSignIn}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          Login with Google
        </Button>
      </div>

      <div className="text-center text-sm mt-4">
        Don't have an account?{' '}
        <a
          className="text-violet-600 hover:text-violet-700 font-medium underline underline-offset-4 cursor-pointer transition-colors"
          onClick={handleStartRecruiting}
        >
          Sign up
        </a>
      </div>
    </>
  );
}
