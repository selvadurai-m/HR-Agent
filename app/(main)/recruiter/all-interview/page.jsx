'use client';
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/services/supabaseClient';
import {
  Video,
  Sparkles,
  Search,
  Filter,
  LayoutGrid,
  List,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import InterviewCard from '../dashboard/_components/interviewcard';
import { useRouter } from 'next/navigation';
import { DB_TABLES } from '@/services/Constants';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function AllInterview() {
  const router = useRouter();
  const [InterviewList, setInterviewList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useUser();

  const GetInterviewList = useCallback(async () => {
    if (!user?.email) {
      console.log('No user email, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Fetching interviews for email:', user.email);
    console.log('Using table:', DB_TABLES.INTERVIEWS);

    let { data: Interviews, error } = await supabase
      .from(DB_TABLES.INTERVIEWS)
      .select('*, interview_results(*)') // <-- JOIN the related table
      .eq('email', user.email)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching interviews:', error);
      setLoading(false);
      return;
    }

    console.log('Fetched interviews:', Interviews);
    console.log('Interview count:', Interviews?.length || 0);
    setInterviewList(Interviews || []);
    setFilteredList(Interviews || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await GetInterviewList();
    })();
  }, [user, GetInterviewList]);

  // Helper function to get interview status
  const getInterviewStatus = (interview) => {
    const interviewResults = interview['interview_results'] || [];
    const completedResults = interviewResults.filter((r) => r?.completed_at);
    const pendingCount = interviewResults.length - completedResults.length;

    if (completedResults.length === 0 && interviewResults.length === 0) {
      return 'active';
    }
    if (completedResults.length > 0 && pendingCount === 0) {
      return 'completed';
    }
    if (completedResults.length > 0) {
      return 'in-progress';
    }
    return 'active';
  };

  // Combined filter effect for search and status
  useEffect(() => {
    let filtered = InterviewList;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((interview) =>
        interview.job_position
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((interview) => {
        const status = getInterviewStatus(interview);
        return status === statusFilter;
      });
    }

    setFilteredList(filtered);
  }, [searchQuery, statusFilter, InterviewList]);

  const handleInterviewDelete = () => {
    GetInterviewList();
  };

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Interviews', icon: null },
    { value: 'active', label: 'Active', icon: null },
    { value: 'in-progress', label: 'In Progress', icon: null },
    { value: 'completed', label: 'Completed', icon: null },
  ];

  const activeFilterLabel =
    filterOptions.find((opt) => opt.value === statusFilter)?.label || 'Filter';

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
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Interviews</h1>
            <p className="text-sm text-gray-500">
              {InterviewList.length} total interviews
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

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search interviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-11 bg-white border-gray-200 focus:border-violet-300 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 px-4 rounded-xl border-gray-200 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 transition-all ${statusFilter !== 'all'
                    ? 'bg-violet-50 border-violet-300 text-violet-600'
                    : ''
                  }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {activeFilterLabel}
                {statusFilter !== 'all' && (
                  <span className="ml-1.5 flex items-center justify-center w-5 h-5 text-xs font-semibold bg-violet-600 text-white rounded-full">
                    1
                  </span>
                )}
                <ChevronDown className="w-4 h-4 ml-1.5 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border-gray-200 shadow-lg"
            >
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg ${statusFilter === option.value
                      ? 'bg-violet-50 text-violet-700 font-medium'
                      : 'hover:bg-gray-50'
                    }`}
                >
                  <span>{option.label}</span>
                  {statusFilter === option.value && (
                    <Check className="w-4 h-4 text-violet-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div
          className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredList?.length === 0 ? (
        <div className="p-10 flex flex-col items-center gap-5 text-center bg-gradient-to-br from-white to-violet-50/30 border border-gray-100 rounded-2xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl" />
            <div className="relative p-5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-xl shadow-violet-500/30">
              <Video className="text-white h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              {searchQuery || statusFilter !== 'all'
                ? 'No interviews found'
                : 'No interviews yet'}
            </h3>
            <p className="text-gray-500 max-w-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first AI-powered interview and start hiring smarter.'}
            </p>
          </div>
          {!searchQuery && statusFilter === 'all' && (
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
        <div
          className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
        >
          {filteredList.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={index}
              onDelete={handleInterviewDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
export default AllInterview;

