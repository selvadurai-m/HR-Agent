'use client';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import Image from 'next/image';
import {
  Clock,
  Video,
  CheckCircle,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { InterviewDataContext } from '@/context/InterviewDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/app/provider';
import { DB_TABLES } from '@/services/Constants';
import { logger } from '@/lib/logger';
import SystemCheck from './_components/SystemCheck';

function Interview() {
  const params = useParams();
  const interview_id = params?.interview_id;
  const [interviewData, setInterviewData] = useState(null);
  const [userName, setUserName] = useState('');
  const [email, setuser_Email] = useState('');
  // const [interviewDetails, setInterviewDetails] = useState('');
  // const [interviewQuestions, setInterviewQuestions] = useState('');
  // const [interviewDuration, setInterviewDuration] = useState('');
  // const [interviewType, setInterviewType] = useState('');
  // const [interviewStatus, setInterviewStatus] = useState('pending');
  // const [interviewDate, setInterviewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const router = useRouter();
  const [accessDenied, setAccessDenied] = useState(false);
  const { user } = useUser();
  const [showSystemCheck, setShowSystemCheck] = useState(false);
  const [systemCheckPassed, setSystemCheckPassed] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // provider info not needed here

  const GetInterviewDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from(DB_TABLES.INTERVIEWS)
        .select(
          'email, job_position, job_description, duration, type, question_list'
        )
        .eq('interview_id', interview_id);

      if (error) throw error;
      if (!Interviews?.length) throw new Error('No interview found');

      logger.log('Interviews:', Interviews);
      // Set the interview data to state

      setInterviewData(Interviews[0]);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  }, [interview_id]);

  // Check if user already completed this interview
  const checkIfAlreadyCompleted = useCallback(async () => {
    if (!user?.email || !interview_id) return;

    try {
      const { data: results, error } = await supabase
        .from(DB_TABLES.INTERVIEW_RESULTS)
        .select('id, completed_at')
        .eq('interview_id', interview_id)
        .eq('email', user.email)
        .not('completed_at', 'is', null);

      if (!error && results && results.length > 0) {
        setAlreadyCompleted(true);
      }
    } catch (error) {
      logger.error('Error checking completion status:', error);
    }
  }, [user?.email, interview_id]);

  useEffect(() => {
    if (interview_id) GetInterviewDetails();
  }, [GetInterviewDetails]);

  useEffect(() => {
    if (user?.email && interview_id) {
      checkIfAlreadyCompleted();
    }
  }, [user?.email, interview_id, checkIfAlreadyCompleted]);

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }
      // No email comparison, just require a session
      setAccessDenied(false);
    };
    checkAccess();
  }, [router, interview_id]);

  useEffect(() => {
    if (user) {
      setuser_Email(user.email || '');
      setUserName(user.name || '');
    }
  }, [user]);

  // Duplicate GetInterviewDetails removed — use the useCallback version defined above.

  const validateJoin = () => {
    if (!userName.trim()) {
      toast.warning('Full name is required');
      return false;
    }

    if (userName.trim().split(' ').length < 2) {
      toast.warning('Please provide your full name (e.g., First Last)');
      return false;
    }

    return true;
  };

  const handleStartSystemCheck = () => {
    if (!validateJoin()) return;
    setShowSystemCheck(true);
  };

  const handleSystemCheckComplete = () => {
    setSystemCheckPassed(true);
    setShowSystemCheck(false);
    onJoinInterview();
  };

  const handleSkipSystemCheck = () => {
    setShowSystemCheck(false);
    onJoinInterview();
  };

  const onJoinInterview = async () => {
    if (!validateJoin()) return; // Deny entry if validation fails

    try {
      const newInterviewInfo = {
        ...interviewInfo,
        candidate_name: userName,
        job_position: interviewData?.job_position,
        job_description: interviewData?.job_description,
        duration: interviewData?.duration,
        email: email,
        type: interviewData?.type,
        question_list: interviewData?.question_list, // Use the existing questions
        interview_id: interview_id,
      };
      setInterviewInfo(newInterviewInfo);

      if (typeof window !== 'undefined') {
        localStorage.setItem('interviewInfo', JSON.stringify(newInterviewInfo));
      }
      toast.success('Creating your interview session...');
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Smooth delay
      router.push(`/interview/${interview_id}/start`);
    } catch (err) {
      logger.error('Join interview failed', err);
      toast.error('Connection failed');
    }
  };

  if (accessDenied) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to access this interview.
          </p>
        </div>
      </div>
    );
  }

  // Show completed interview message
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-100">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Interview Already Completed
            </h2>
            <p className="text-gray-600 mb-6">
              You have already completed this interview. Your responses have
              been recorded and are being reviewed.
            </p>
            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <p className="text-emerald-700 text-sm font-medium">
                Thank you for participating! The recruiter will review your
                interview and get back to you soon.
              </p>
            </div>
            <Button
              onClick={() => router.push('/candidate/dashboard')}
              className="w-full bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 text-white py-3 rounded-xl font-medium"
            >
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Animated Header */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="relative w-28 h-28 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-violet-200 rounded-full"
            />
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-violet-600">
            AI Interview Portal
          </h1>
          <p className="mt-2 text-gray-500">
            Next-generation hiring experience
          </p>
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20"
        >
          {/* Interview Header */}
          <div className="bg-gradient-to-r from-violet-600 to-violet-600 px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {interviewData?.job_position || 'AI Interview'}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-violet-100">
                  <Clock className="h-4 w-4" />
                  <span>{interviewData?.duration || '30 min'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white">Live Session Ready</span>
              </div>
            </div>
          </div>

          {/* Interview Content */}
          <div className="p-8">
            {/* Visual Timeline */}
            <div className="flex items-center justify-center mb-10">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-gray-200" />
                </div>
                <div className="relative flex justify-between">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-violet-100 border-2 border-violet-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-violet-700">
                          {step}
                        </span>
                      </div>
                      <span className="mt-2 text-xs text-gray-500">
                        {['Setup', 'Interview', 'Results'][step - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Candidate Form */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name
                </label>
                <Input
                  placeholder="Eg: Sujeeth Kumar"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="py-3 px-4 border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 rounded-xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Email
                </label>
                <Input
                  type="email"
                  placeholder="Eg: Sujeethkumar@example.com"
                  value={email}
                  onChange={(e) => setuser_Email(e.target.value)}
                  className="py-3 px-4 border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 rounded-xl"
                />
              </motion.div>

              {/* Preparation Checklist */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-violet-50/50 rounded-xl p-5 border border-violet-100"
              >
                <h4 className="font-medium text-violet-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Preparation Checklist
                </h4>
                <ul className="space-y-3">
                  {[
                    'Provide a proper name & valid email address',
                    'Give access to your microphone',
                    'Ensure a stable internet connection',
                    'Enable camera permissions',
                    'Use Chrome or Edge browser',
                    'Find a quiet environment',
                    'Have your resume handy',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <div className="h-4 w-4 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-violet-500" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Join Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <Button
                  onClick={handleStartSystemCheck}
                  className={`w-full py-4 rounded-xl text-lg font-medium transition-all bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 shadow-lg shadow-violet-500/25 ${!loading && 'hover:shadow-xl hover:-translate-y-0.5'}`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Preparing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Settings className="h-5 w-5" />
                      Check System &amp; Start Interview
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-500 mt-12"
        >
          Powered by AI interview technology • Secure and confidential
        </motion.p>
      </motion.div>

      {/* System Check Modal */}
      <AnimatePresence>
        {showSystemCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <SystemCheck
                onAllChecksPassed={handleSystemCheckComplete}
                onSkip={handleSkipSystemCheck}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Interview;
