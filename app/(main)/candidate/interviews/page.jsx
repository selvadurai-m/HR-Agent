'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
} from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';
import { DB_TABLES } from '@/services/Constants';

export default function CandidateInterviews() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchCandidateInterviews = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all interview results for this candidate
      const { data: results, error } = await supabase
        .from(DB_TABLES.INTERVIEW_RESULTS)
        .select(
          `
          *,
          ${DB_TABLES.INTERVIEWS} (
            job_position,
            job_description,
            type,
            duration,
            created_at,
            email
          )
        `
        )
        .eq('email', user.email)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching interviews:', error);
        toast.error('Failed to load interviews');
        return;
      }

      setInterviews(results || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCandidateInterviews();
    }
  }, [user, fetchCandidateInterviews]);

  // Removed unused score helpers (not referenced in JSX)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-violet-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin"></div>
        </div>
        <span className="text-gray-600 font-medium">
          Loading your interviews...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - matching recruiter style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
            <p className="text-sm text-gray-500">
              Track all your interview sessions and results
            </p>
          </div>
        </div>
      </div>

      {interviews.length === 0 ? (
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No interviews yet
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              You haven&apos;t participated in any interviews yet. When you
              complete an interview, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {interviews.map((result, index) => (
            <Card
              key={result.id}
              className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:translate-y-[-2px] animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg">
                        {result.Interviews?.job_position || 'Interview'}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {moment(result.created_at).format('MMM DD, YYYY')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {result.Interviews?.duration || 'N/A'}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.Interviews?.type || 'Interview'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <Badge
                      variant={
                        result.status === 'completed' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {result.status === 'completed'
                        ? 'In Progress'
                        : 'Completed'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      You will be emailed from the recruiter.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
