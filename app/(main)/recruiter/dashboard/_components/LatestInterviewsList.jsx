'use client';
import { Video, ArrowRight, Sparkles } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { useUser } from '@/app/provider';
import InterviewCard from './interviewcard';
import { DB_TABLES } from '@/services/Constants';
import Link from 'next/link';

function LatestInterviewsList() {
  const router = useRouter();
  const [InterviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Stable callback so it can be safely called from useEffect
  const GetInterviewList = useCallback(async () => {
    if (!user?.email) {
      console.log('No user email, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Fetching latest interviews for email:', user.email);

    let { data: Interviews, error: fetchError } = await supabase
      .from(DB_TABLES.INTERVIEWS)
      .select('*, interview_results(*)') // <-- JOIN the related table
      .eq('email', user.email)
      .order('id', { ascending: false })
      .limit(6);

    if (fetchError) {
      console.error('Error fetching interviews:', fetchError);
    }

    console.log('Latest interviews:', Interviews);
    console.log('Count:', Interviews?.length || 0);
    setInterviewList(Interviews || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await GetInterviewList();
    })();
  }, [user, GetInterviewList]);

  const handleInterviewDelete = () => {
    // Refresh the interview list after deletion
    GetInterviewList();
  };

  // Skeleton loading cards
  const SkeletonCard = () => (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div className="flex gap-3 mt-5">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      {/* Section Header with animation */}
      <div className="flex items-center justify-between mb-5 group cursor-default">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
              Recent Interviews
              <span className="inline-block w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            </h2>
            <p className="text-sm text-gray-500">
              Your latest interview sessions
            </p>
          </div>
        </div>
        {InterviewList?.length > 0 && (
          <Link
            href="/recruiter/all-interview"
            className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-all duration-300 hover:gap-2.5 group/link"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform duration-300" />
          </Link>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : InterviewList?.length === 0 ? (
        /* Empty State with animations */
        <div className="p-10 flex flex-col items-center gap-5 text-center bg-gradient-to-br from-white to-violet-50/30 border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 group">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative p-5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-xl shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Video className="text-white h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              No interviews yet
            </h3>
            <p className="text-gray-500 max-w-sm">
              Create your first AI-powered interview and start hiring smarter.
            </p>
          </div>
          <Button
            className="cursor-pointer relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30 px-6 py-5 rounded-xl text-base hover:scale-105 transition-all duration-300 group/btn"
            onClick={() => router.push('/recruiter/dashboard/create-interview')}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <Sparkles className="w-4 h-4 mr-2 relative" />
            <span className="relative">Create New Interview</span>
          </Button>
        </div>
      ) : (
        /* Interview Cards Grid with stagger animation */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {InterviewList.map((interview, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <InterviewCard
                interview={interview}
                onDelete={handleInterviewDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviewsList;
