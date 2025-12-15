'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Shield,
  Zap,
  ArrowLeft,
  Users,
  BarChart3,
  Clock,
} from 'lucide-react';
import { RegisterForm } from '../../components/register-form';
import { FloatingParticles } from '@/components/ui/FloatingParticles';

export default function RegisterPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex overflow-hidden">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-violet-600 to-violet-700 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
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
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 text-white">
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
              className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Sparkles className="w-12 h-12" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-3">Join TalentAI Today</h2>
            <p className="text-white/80 text-base max-w-sm mb-8">
              Start hiring smarter with AI-powered interviews and intelligent
              candidate matching.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                {
                  icon: <Users className="w-5 h-5" />,
                  value: '10K+',
                  label: 'Users',
                },
                {
                  icon: <BarChart3 className="w-5 h-5" />,
                  value: '95%',
                  label: 'Accuracy',
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  value: '80%',
                  label: 'Time Saved',
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 max-w-sm mx-auto"
            >
              <p className="text-white/90 italic text-sm mb-3">
                &ldquo;TalentAI reduced our hiring time by 70% and helped us
                find candidates we would have missed.&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-400" />
                <div className="text-left">
                  <div className="font-medium text-sm">Sarah Johnson</div>
                  <div className="text-xs text-white/70">
                    HR Director, TechCorp
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-4 md:p-6 relative">
        <FloatingParticles />

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
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
          className="mt-2 flex justify-center lg:justify-end"
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
        <div className="flex-1 flex items-center justify-center py-2">
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
                <Zap className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">
                  Get Started Free
                </span>
              </motion.div>
            </div>

            {/* Register Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <RegisterForm />
            </div>

            {/* Sign In Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-600 mt-4"
            >
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-violet-600 hover:text-violet-600 transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
