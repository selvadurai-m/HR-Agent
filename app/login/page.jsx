'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Shield, Zap, ArrowLeft } from 'lucide-react';
import { LoginForm } from '../../components/login-form';
import { FloatingParticles } from '@/components/ui/FloatingParticles';

export default function LoginPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-4 md:p-6 relative">
        <FloatingParticles />

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 flex justify-center lg:justify-start"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-600/20 to-violet-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-2.5 bg-gradient-to-br from-violet-600 to-violet-600 rounded-xl shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-violet-600 to-violet-700 bg-clip-text text-transparent">
              TalentAI
            </span>
          </Link>
        </motion.div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-sm"
          >
            {/* Welcome Text */}
            <div className="text-center mb-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-200 mb-2"
              >
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">
                  Welcome Back
                </span>
              </motion.div>
            </div>

            {/* Login Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <LoginForm />
            </div>

            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-600 mt-4"
            >
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-violet-600 hover:text-violet-600 transition-colors"
              >
                Sign up for free
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-violet-600 to-violet-700 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
          />
        </div>

        {/* Rotating rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* AI Icon */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 30px rgba(255,255,255,0.2)',
                  '0 0 60px rgba(255,255,255,0.4)',
                  '0 0 30px rgba(255,255,255,0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <Brain className="w-16 h-16" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-4">AI-Powered Recruitment</h2>
            <p className="text-white/80 text-lg max-w-md mb-12">
              Transform your hiring process with intelligent interviews and
              data-driven insights.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {[
                {
                  icon: <Shield className="w-5 h-5" />,
                  text: 'Secure & Private',
                },
                { icon: <Zap className="w-5 h-5" />, text: 'Lightning Fast' },
                { icon: <Sparkles className="w-5 h-5" />, text: 'AI-Powered' },
                { icon: <Brain className="w-5 h-5" />, text: 'Smart Analysis' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  {feature.icon}
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
