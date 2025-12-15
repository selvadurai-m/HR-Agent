'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Brain,
  Users,
  Sparkles,
  BarChart2,
  Clock,
  Check,
  Target,
  Mic,
  Video,
  MessageSquare,
  TrendingUp,
  Zap,
  Star,
  Play,
  Menu,
  X,
  Cpu,
  Waves,
  Activity,
} from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { useUser } from '@/app/provider';
import { FloatingParticles } from '@/components/ui/FloatingParticles';

// Animated Counter Hook
const useCounter = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, hasStarted]);

  return { count, setHasStarted };
};

// AI Brain Visualization Component
const AIBrainVisualization = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border border-violet-500/30"
      >
        {/* Orbiting dots */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-violet-500 rounded-full shadow-lg shadow-violet-500/50"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translateX(128px) translateY(-50%)`,
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.div>

      {/* Middle rotating ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute w-48 h-48 md:w-60 md:h-60 rounded-full border border-cyan-500/30"
      >
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translateX(96px) translateY(-50%)`,
            }}
            animate={{ scale: [1, 1.8, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Inner pulsing ring */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-violet-600/20 to-cyan-600/20 blur-sm"
      />

      {/* Central brain icon */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 20px rgba(139, 92, 246, 0.3)',
            '0 0 40px rgba(139, 92, 246, 0.6)',
            '0 0 20px rgba(139, 92, 246, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 p-6 md:p-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-600"
      >
        <Brain className="w-12 h-12 md:w-16 md:h-16 text-white" />

        {/* Pulse rings */}
        <motion.div
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-violet-400"
        />
        <motion.div
          animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute inset-0 rounded-full border border-violet-400"
        />
      </motion.div>

      {/* Floating data points */}
      {[
        { x: -100, y: -60, delay: 0 },
        { x: 100, y: -40, delay: 0.5 },
        { x: -80, y: 60, delay: 1 },
        { x: 90, y: 50, delay: 1.5 },
        { x: 0, y: -90, delay: 2 },
        { x: 0, y: 90, delay: 2.5 },
      ].map((point, i) => (
        <motion.div
          key={i}
          className="absolute flex items-center justify-center"
          style={{
            left: `calc(50% + ${point.x}px)`,
            top: `calc(50% + ${point.y}px)`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: point.delay }}
        >
          <div className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center">
            {i % 3 === 0 && <Sparkles className="w-4 h-4 text-yellow-500" />}
            {i % 3 === 1 && <Zap className="w-4 h-4 text-cyan-600" />}
            {i % 3 === 2 && <Activity className="w-4 h-4 text-emerald-600" />}
          </div>
        </motion.div>
      ))}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[
          { x1: '35%', y1: '35%', x2: '50%', y2: '50%' },
          { x1: '65%', y1: '35%', x2: '50%', y2: '50%' },
          { x1: '35%', y1: '65%', x2: '50%', y2: '50%' },
          { x1: '65%', y1: '65%', x2: '50%', y2: '50%' },
        ].map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// AI Neural Network Animation
const NeuralNetwork = () => {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + (i % 4) * 30,
    y: 20 + Math.floor(i / 4) * 30,
  }));

  return (
    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
      {nodes.map((node, i) =>
        nodes.slice(i + 1).map((target, j) => (
          <motion.line
            key={`${i}-${j}`}
            x1={`${node.x}%`}
            y1={`${node.y}%`}
            x2={`${target.x}%`}
            y2={`${target.y}%`}
            stroke="url(#neuralGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.1, 0.5, 0.1] }}
            transition={{
              duration: 3,
              delay: (i + j) * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))
      )}
      {nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={`${node.x}%`}
          cy={`${node.y}%`}
          r="4"
          fill="url(#nodeGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{
            duration: 2,
            delay: node.id * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <defs>
        <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="nodeGradient">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
      </defs>
    </svg>
  );
};

// Magnetic Button Component
const MagneticButton = ({
  children,
  className,
  onClick,
  variant = 'default',
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * 0.15);
      y.set((e.clientY - centerY) * 0.15);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Button
        className={className}
        onClick={onClick}
        variant={variant}
        size="lg"
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Glowing Card Component
const GlowingCard = ({ children, className, glowColor = 'violet' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const glowColors = {
    violet: 'rgba(139, 92, 246, 0.4)',
    blue: 'rgba(59, 130, 246, 0.4)',
    emerald: 'rgba(16, 185, 129, 0.4)',
    orange: 'rgba(249, 115, 22, 0.4)',
    cyan: 'rgba(6, 182, 212, 0.4)',
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColors[glowColor]}, transparent 40%)`,
        }}
      />
      {/* Border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColors[glowColor]}, transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );
};

// Typewriter Effect Component
const TypewriterText = ({ texts, className }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentFullText.length) {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, texts, currentTextIndex]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.75 h-[1em] bg-violet-400 ml-1 align-middle"
      />
    </span>
  );
};

// Animated AI Badge
const AIBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/20 via-violet-500/20 to-cyan-500/20 border border-violet-500/30 mb-8 overflow-hidden"
  >
    {/* Animated border */}
    <div className="absolute inset-0 rounded-full">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500 opacity-50 blur-sm animate-spin-slow" />
    </div>
    <div className="absolute inset-px rounded-full bg-[#0a0a0f]" />

    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      className="relative"
    >
      <Sparkles className="w-4 h-4 text-violet-400" />
    </motion.div>
    <span className="relative text-sm font-medium bg-gradient-to-r from-violet-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
      AI-Powered Recruitment Platform
    </span>
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="relative w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
    />
  </motion.div>
);

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else if (user.role === 'candidate') {
        router.push('/candidate/dashboard');
      }
    }
  }, [user, router]);

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'AI Voice Interviews',
      description:
        'Natural voice conversations powered by advanced AI that adapts to each candidate.',
      gradient: 'from-violet-500 to-purple-600',
      glowColor: 'violet',
      delay: 0,
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Smart Analysis',
      description:
        'Deep learning algorithms analyze responses for skills, personality, and culture fit.',
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'blue',
      delay: 0.1,
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: 'Instant Insights',
      description:
        'Get comprehensive candidate reports with actionable hiring recommendations.',
      gradient: 'from-emerald-500 to-teal-500',
      glowColor: 'emerald',
      delay: 0.2,
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Availability',
      description:
        'Candidates interview on their schedule. No more coordination headaches.',
      gradient: 'from-orange-500 to-amber-500',
      glowColor: 'orange',
      delay: 0.3,
    },
  ];

  const stats = [
    {
      value: 10,
      suffix: 'x',
      label: 'Faster Hiring',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      value: 85,
      suffix: '%',
      label: 'Time Saved',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      value: 3.5,
      suffix: 'x',
      label: 'Better Matches',
      icon: <Target className="w-5 h-5" />,
      isDecimal: true,
    },
    {
      value: 99,
      suffix: '%',
      label: 'Satisfaction',
      icon: <Star className="w-5 h-5" />,
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Interview',
      description:
        'Define your job requirements and let AI generate tailored interview questions.',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'violet',
    },
    {
      number: '02',
      title: 'Invite Candidates',
      description:
        'Share a simple link. Candidates join from any device, anytime.',
      icon: <Users className="w-8 h-8" />,
      color: 'blue',
    },
    {
      number: '03',
      title: 'AI Conducts Interview',
      description:
        'Our AI interviewer engages candidates in natural, adaptive conversations.',
      icon: <Video className="w-8 h-8" />,
      color: 'emerald',
    },
    {
      number: '04',
      title: 'Review & Decide',
      description:
        'Get detailed analytics, transcripts, and AI-powered hiring recommendations.',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'cyan',
    },
  ];

  const aiKeywords = [
    'AI Interviews',
    'Smart Hiring',
    'Auto Screening',
    'Voice AI',
  ];

  // Stat Counter Component
  const StatCard = ({ stat, index }) => {
    const { count, setHasStarted } = useCounter(
      stat.isDecimal ? stat.value * 10 : stat.value,
      2000,
      true
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onViewportEnter={() => setHasStarted(true)}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="relative group p-6 rounded-2xl bg-white border border-gray-200 hover:border-violet-400 shadow-lg hover:shadow-xl transition-all duration-500 cursor-default"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-200/40 to-cyan-200/40 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <motion.div
            className="flex items-center gap-2 text-violet-600 mb-2"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
          >
            {stat.icon}
          </motion.div>
          <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
            {stat.isDecimal ? (count / 10).toFixed(1) : count}
            {stat.suffix}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>

        {/* Animated corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-violet-300/30 to-transparent rounded-full"
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-900 overflow-hidden">
      {/* Enhanced Animated Background - Light Theme */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/50 via-white to-blue-100/30" />

        {/* Animated gradient orbs - Light Theme */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-150 h-150 bg-violet-400/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-1/4 w-125 h-125 bg-blue-400/20 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-violet-400/10 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/3 w-75 h-75 bg-cyan-400/15 rounded-full blur-[100px]"
        />

        {/* Floating particles - reduced count for performance */}
        <FloatingParticles count={12} />

        {/* Neural network */}
        <NeuralNetwork />

        {/* Grid pattern with animation */}
        <motion.div
          animate={{ opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px]"
        />

        {/* Scanning line effect */}
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent blur-sm"
        />
      </div>

      {/* Navbar with enhanced effects */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl shadow-sm" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo with enhanced animation */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-600 to-cyan-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"
                />
                <div className="relative p-2.5 bg-gradient-to-br from-violet-600 via-violet-600 to-violet-700 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Brain className="w-6 h-6 text-white relative z-10" />
                </div>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-violet-600 to-violet-700 bg-clip-text text-transparent">
                TalentAI
              </span>
            </Link>

            {/* Desktop Nav with hover effects */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'Pricing'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="relative text-gray-600 hover:text-violet-600 transition-colors text-sm font-medium group py-2"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* CTA with enhanced styling */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 relative overflow-hidden group"
                onClick={() => router.push('/login')}
              >
                <span className="relative z-10">Sign In</span>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 to-violet-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <MagneticButton
                className="bg-gradient-to-r from-violet-600 via-violet-600 to-violet-600 bg-size-[200%_100%] hover:bg-position-[100%_0] text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-500"
                onClick={() => router.push('/login')}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-violet-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-gray-200"
            >
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-violet-600 transition-colors px-2 py-2"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-600 hover:text-violet-600 transition-colors px-2 py-2"
                >
                  How It Works
                </a>
                <a
                  href="#pricing"
                  className="text-gray-600 hover:text-violet-600 transition-colors px-2 py-2"
                >
                  Pricing
                </a>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700"
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-violet-600 to-violet-600 text-white"
                    onClick={() => router.push('/login')}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section with AI Brain Visualization */}
      <section className="relative z-10 pt-32 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Two Column Layout - Title + AI Brain */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Enhanced Badge */}
              <AIBadge />

              {/* Headline with typewriter effect */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
              >
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Hire Smarter with
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent inline-block">
                  <TypewriterText
                    texts={aiKeywords}
                    className="bg-gradient-to-r from-violet-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent"
                  />
                </span>
              </motion.h1>

              {/* Subheadline with fade effect */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              >
                Automate your interview process with AI that conducts{' '}
                <span className="text-violet-600 font-medium">
                  natural voice conversations
                </span>
                ,{' '}
                <span className="text-violet-600 font-medium">
                  evaluates candidates
                </span>
                , and delivers{' '}
                <span className="text-emerald-600 font-medium">
                  actionable insights
                </span>
                —all in minutes.
              </motion.p>

              {/* CTA Buttons with magnetic effect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <MagneticButton
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-violet-600 to-violet-600 bg-size-[200%_100%] animate-gradient-x text-white px-8 py-6 text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-500 group"
                  onClick={() => router.push('/login')}
                >
                  <span className="relative z-10 flex items-center">
                    Start Free Trial
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.span>
                  </span>
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg group border-0 shadow-xl shadow-white/10"
                  onClick={() => router.push('/auth')}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mr-2"
                  >
                    <Play className="w-5 h-5 text-violet-600 fill-violet-600" />
                  </motion.span>
                  Watch Demo
                </MagneticButton>
              </motion.div>

              {/* Trust Indicators with staggered animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-gray-500"
              >
                {[
                  { text: 'No credit card required', delay: 0 },
                  { text: '5 free interviews', delay: 0.1 },
                  { text: 'Setup in 2 minutes', delay: 0.2 },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + item.delay }}
                    className="flex items-center gap-2 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                    </motion.div>
                    <span className="group-hover:text-gray-900 transition-colors">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - AI Brain Visualization */}
            <div className="hidden lg:flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative w-full h-125"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 blur-3xl" />
                <AIBrainVisualization />
              </motion.div>
            </div>
          </div>

          {/* Stats Bar with animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </motion.div>

          {/* Mobile AI Brain (visible only on small screens) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="lg:hidden mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 blur-3xl" />
            <div className="relative h-64">
              <AIBrainVisualization />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-sm text-gray-500 mt-4"
            >
              <span className="text-violet-600">●</span> AI-powered analysis in
              real-time
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Section with glowing cards */}
      <section
        id="features"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-100 border border-blue-200 mb-6 overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
              />
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Powerful Features
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-size-[200%_100%] bg-clip-text text-transparent"
              >
                Hire the Best
              </motion.span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-600 max-w-2xl mx-auto text-lg"
            >
              Our AI-powered platform streamlines every step of your hiring
              process.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlowingCard
                key={index}
                glowColor={feature.glowColor}
                className="p-8 rounded-3xl bg-white border border-gray-200 shadow-lg hover:shadow-xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay }}
                  className="relative h-full"
                >
                  {/* Animated icon container */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg overflow-hidden`}
                  >
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    <span className="relative z-10">{feature.icon}</span>
                  </motion.div>

                  <h3 className="relative text-xl font-semibold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="relative text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom accent line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: feature.delay + 0.3, duration: 0.5 }}
                    className={`absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} origin-left opacity-50`}
                  />
                </motion.div>
              </GlowingCard>
            ))}
          </div>

          {/* AI Processing Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <div className="relative flex items-center gap-4 px-8 py-4 rounded-full bg-white border border-gray-200 shadow-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Cpu className="w-5 h-5 text-violet-600" />
              </motion.div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">AI Processing</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-violet-600"
                    />
                  ))}
                </div>
              </div>
              <div className="w-px h-6 bg-gray-300" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-5 h-5 text-cyan-600" />
              </motion.div>
              <span className="text-gray-600 text-sm">Smart Analysis</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section with enhanced animations */}
      <section
        id="how-it-works"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8"
      >
        {/* Section background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-100/50 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-100 border border-emerald-200 mb-6 overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Activity className="w-4 h-4 text-emerald-600" />
              </motion.div>
              <span className="text-sm font-medium text-emerald-700">
                Simple Process
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                How TalentAI
              </span>{' '}
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-size-[200%_100%] bg-clip-text text-transparent"
              >
                Works
              </motion.span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-600 max-w-2xl mx-auto text-lg"
            >
              From job posting to hire in four simple steps.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const colorClasses = {
                violet: {
                  bg: 'from-violet-500/20 to-purple-500/20',
                  text: 'text-violet-600',
                  number: 'text-violet-300',
                  border: 'hover:border-violet-400',
                  glow: 'group-hover:shadow-violet-300/30',
                },
                blue: {
                  bg: 'from-blue-500/20 to-cyan-500/20',
                  text: 'text-blue-600',
                  number: 'text-blue-300',
                  border: 'hover:border-blue-400',
                  glow: 'group-hover:shadow-blue-300/30',
                },
                emerald: {
                  bg: 'from-emerald-500/20 to-teal-500/20',
                  text: 'text-emerald-600',
                  number: 'text-emerald-300',
                  border: 'hover:border-emerald-400',
                  glow: 'group-hover:shadow-emerald-300/30',
                },
                cyan: {
                  bg: 'from-cyan-500/20 to-blue-500/20',
                  text: 'text-cyan-600',
                  number: 'text-cyan-300',
                  border: 'hover:border-cyan-400',
                  glow: 'group-hover:shadow-cyan-300/30',
                },
              };
              const colors = colorClasses[step.color];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Animated Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-px z-0 overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.15 + 0.5,
                          duration: 0.8,
                        }}
                        className="h-full bg-gradient-to-r from-gray-300 via-gray-200 to-transparent origin-left"
                      />
                      {/* Animated dot traveling along the line */}
                      <motion.div
                        animate={{ x: ['-10%', '110%'] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5,
                          ease: 'easeInOut',
                        }}
                        className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${colors.text.replace('text', 'bg')} shadow-lg`}
                        style={{ filter: 'blur(1px)' }}
                      />
                    </div>
                  )}

                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`relative p-8 rounded-3xl bg-white border border-gray-200 ${colors.border} transition-all duration-500 group shadow-lg hover:shadow-xl ${colors.glow}`}
                  >
                    {/* Animated Step Number */}
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      whileHover={{ opacity: 0.8, scale: 1.1 }}
                      className={`absolute -top-6 -left-4 text-8xl font-black ${colors.number} transition-all duration-500 select-none`}
                    >
                      {step.number}
                    </motion.div>

                    <div className="relative">
                      {/* Animated icon with pulse effect */}
                      <motion.div
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.text} mb-4 relative overflow-hidden`}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colors.bg}`}
                        />
                        <span className="relative z-10">{step.icon}</span>
                      </motion.div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-900 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                        {step.description}
                      </p>
                    </div>

                    {/* Corner accent */}
                    <div
                      className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl ${colors.bg} rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with enhanced effects */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden group"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-600 to-blue-600" />
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 bg-size-[300%_100%] opacity-80"
            />

            {/* Animated circles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1/2 -right-1/4 w-150 h-150 border border-white/10 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1/2 -left-1/4 w-125 h-125 border border-white/10 rounded-full"
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}

            <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
              {/* Animated AI Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative inline-flex mb-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent blur-xl"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
              >
                Ready to Transform Your Hiring?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-white/80 max-w-2xl mx-auto mb-10"
              >
                Join thousands of companies using TalentAI to find and hire the
                best candidates faster than ever.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <MagneticButton
                  className="w-full sm:w-auto bg-white text-violet-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => router.push('/login')}
                >
                  Get Started Free
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.span>
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
                  onClick={() => router.push('/auth')}
                >
                  Schedule Demo
                </MagneticButton>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with enhanced styling */}
      <footer className="relative z-10 border-t border-gray-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo with animation */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 bg-gradient-to-br from-violet-600 to-violet-600 rounded-xl">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <span className="text-lg font-bold bg-gradient-to-r from-violet-600 via-violet-600 to-violet-700 bg-clip-text text-transparent">
                TalentAI
              </span>
            </Link>

            {/* Links with hover effects */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              {['Features', 'How It Works', 'Privacy', 'Terms'].map((link) => (
                <motion.a
                  key={link}
                  href={
                    link === 'Privacy' || link === 'Terms'
                      ? '#'
                      : `#${link.toLowerCase().replace(' ', '-')}`
                  }
                  className="relative hover:text-violet-600 transition-colors group"
                  whileHover={{ y: -2 }}
                >
                  {link}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Copyright with subtle animation */}
            <motion.p
              animate={{ opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-sm text-gray-500"
            >
              © {new Date().getFullYear()} TalentAI. All rights reserved.
            </motion.p>
          </div>
        </div>
      </footer>

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
