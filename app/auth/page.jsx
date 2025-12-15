'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MoveRight,
  Sparkles,
  ShieldCheck,
  Clock,
  BarChart2,
  Zap,
  Brain,
  ArrowLeft,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { signInWithGoogle } from '@/lib/auth';

export default function Login() {
  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) console.error(error.message);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row h-full">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-6 md:px-8 lg:px-12 xl:px-16 relative">
          <FloatingParticles />

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-6 left-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 relative z-10"
          >
            {/* Logo */}
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-violet-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative p-2 bg-gradient-to-br from-violet-600 to-violet-600 rounded-lg shadow-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                TalentAI
              </h1>
            </div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Transform Your{' '}
                <span className="bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent">
                  Hiring Process
                </span>{' '}
                with AI
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 max-w-lg text-sm lg:text-base leading-relaxed"
            >
              Our intelligent platform leverages cutting-edge AI to help you
              find, evaluate, and hire top talent faster than ever.
            </motion.p>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-2"
            >
              {[
                {
                  icon: <ShieldCheck className="h-4 w-4 text-violet-600" />,
                  title: 'Bias-Free',
                  color: 'violet',
                },
                {
                  icon: <Clock className="h-4 w-4 text-violet-600" />,
                  title: '80% Faster',
                  color: 'violet',
                },
                {
                  icon: <BarChart2 className="h-4 w-4 text-emerald-600" />,
                  title: 'Data Insights',
                  color: 'emerald',
                },
                {
                  icon: <Zap className="h-4 w-4 text-amber-600" />,
                  title: 'Smart Match',
                  color: 'amber',
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="flex items-center gap-2 p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className={`p-1.5 rounded-md bg-${feature.color}-100`}>
                    {feature.icon}
                  </div>
                  <span className="font-medium text-gray-900 text-sm">
                    {feature.title}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + item * 0.1 }}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-200 to-violet-200 border-2 border-white shadow-md"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-6 lg:px-8 bg-gradient-to-br from-violet-600 via-violet-600 to-violet-700 relative overflow-hidden">
          {/* Decorative elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
          />

          {/* Rotating rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 border border-white/5 rounded-full"
          />

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 text-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-600 flex items-center justify-center mb-4 shadow-lg"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>

              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent mb-1">
                Welcome to TalentAI
              </h2>
              <p className="text-gray-600 text-sm mb-5">
                Sign in with Google to continue
              </p>

              <Button
                onClick={handleGoogleSignIn}
                className="w-full py-5 px-4 inline-flex justify-center items-center gap-3 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 via-violet-600 to-violet-600 bg-size-[200%_100%] hover:bg-position-[100%_0] transition-all duration-500 shadow-lg shadow-violet-500/30 cursor-pointer hover:shadow-xl hover:-translate-y-0.5"
              >
                <Image
                  src="/googleicon.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Continue with Google
                <MoveRight className="h-4 w-4" />
              </Button>

              {/* Benefits */}
              <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {['No credit card', '5 free interviews', '2 min setup'].map(
                  (benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center gap-1.5 text-xs text-gray-600"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {benefit}
                    </motion.div>
                  )
                )}
              </div>
            </div>

            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-violet-50/50 border-t border-gray-100 rounded-b-2xl text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <a
                  href="#"
                  className="font-medium text-violet-600 hover:text-violet-600 transition-colors"
                >
                  Terms
                </a>{' '}
                &{' '}
                <a
                  href="#"
                  className="font-medium text-violet-600 hover:text-violet-600 transition-colors"
                >
                  Privacy
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
