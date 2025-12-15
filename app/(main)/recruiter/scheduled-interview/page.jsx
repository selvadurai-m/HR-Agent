'use client';
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/services/supabaseClient';
import { Video, Calendar, Sparkles, Search, Filter } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import InterviewCard from '../dashboard/_components/interviewcard';
import { useRouter } from 'next/navigation';
import { DB_TABLES } from '@/services/Constants';
import { Input } from '@/components/ui/input';

function ScheduledInterview() {
  const { user } = useUser();
  const router = useRouter();
  const [interviewList, setInterviewList] = useState();
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const GetInterviewList = useCallback(async () => {
    if (!user?.email) {
      console.log('No user email, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Fetching scheduled interviews for email:', user.email);

    const result = await supabase
      .from(DB_TABLES.INTERVIEWS)
      .select('*, interview_results(*)')
      .eq('email', user.email)
      .order('id', { ascending: false });

    console.log('Scheduled interviews result:', result);
    console.log('Interview count:', result.data?.length || 0);

    if (result.error) {
      console.error('Error fetching scheduled interviews:', result.error);
    }

    setInterviewList(result.data || []);
    setFilteredList(result.data || []);
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await GetInterviewList();
    })();
  }, [GetInterviewList]);

  useEffect(() => {
    if (searchQuery && interviewList) {
      const filtered = interviewList.filter((interview) =>
        interview.job_position
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(interviewList || []);
    }
  }, [searchQuery, interviewList]);

  // Skeleton loading card
  const SkeletonCard = () => (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-full mt-5 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Scheduled Interviews
            </h1>
            <p className="text-sm text-gray-500">
              View feedback and candidate responses
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push('/recruiter/dashboard/create-interview')}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 rounded-xl"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Create Interview
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search scheduled interviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-11 bg-white border-gray-200 focus:border-violet-300 rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          className="h-11 px-4 rounded-xl border-gray-200"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredList?.length === 0 ? (
        <div className="p-10 flex flex-col items-center gap-5 text-center bg-gradient-to-br from-white to-emerald-50/30 border border-gray-100 rounded-2xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
            <div className="relative p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/30">
              <Video className="text-white h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              {searchQuery ? 'No interviews found' : 'No scheduled interviews'}
            </h3>
            <p className="text-gray-500 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Create your first interview to get started.'}
            </p>
          </div>
          {!searchQuery && (
            <Button
              onClick={() =>
                router.push('/recruiter/dashboard/create-interview')
              }
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 px-6 py-5 rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create New Interview
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredList?.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={index}
              viewDetail={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScheduledInterview;
