'use client';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Copy,
  Send,
  Trash2,
  Calendar,
  Clock,
  Users,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Eye,
} from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { supabase } from '@/services/supabaseClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DB_TABLES } from '@/services/Constants';

function InterviewCard({ interview, viewDetail = false, onDelete }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const getInterviewUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL.replace(/\/$/, '');
    return `${baseUrl}/interview/${interview?.interview_id}`;
  };

  const copyLink = async () => {
    try {
      const url = getInterviewUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Interview link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Failed to copy: ', err);
    }
  };

  const onSend = () => {
    const interviewUrl = getInterviewUrl();
    window.location.href = `mailto:?subject=AI Recruiter Interview Link&body=Hi, I would like to schedule an interview with you. Please find the link below:\n\n${interviewUrl}`;
    toast.success('Email opened with pre-filled link!');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error: resultsError } = await supabase
        .from(DB_TABLES.INTERVIEW_RESULTS)
        .delete()
        .eq('interview_id', interview.interview_id);

      if (resultsError) {
        console.error('Error deleting interview results:', resultsError);
      }

      const { error: interviewError } = await supabase
        .from(DB_TABLES.INTERVIEWS)
        .delete()
        .eq('interview_id', interview.interview_id);

      if (interviewError) {
        throw interviewError;
      }

      toast.success('Interview deleted successfully!');
      setShowDeleteAlert(false);

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Parse interview type - handle string, array, or JSON string
  const getInterviewTypes = () => {
    const type = interview?.type;
    if (!type) return [];
    if (Array.isArray(type)) return type;
    if (typeof type === 'string') {
      // Try to parse as JSON array
      try {
        const parsed = JSON.parse(type);
        if (Array.isArray(parsed)) return parsed;
        return [type];
      } catch {
        return [type];
      }
    }
    return [];
  };

  const interviewTypes = getInterviewTypes();
  const candidateCount = interview['interview_results']?.length || 0;

  // Calculate completion status and average score
  const interviewResults = interview['interview_results'] || [];
  const completedResults = interviewResults.filter((r) => r?.completed_at);
  const hasCompletedInterviews = completedResults.length > 0;
  const pendingCount = interviewResults.length - completedResults.length;

  // Calculate average score from completed interviews
  const calculateAverageScore = () => {
    if (completedResults.length === 0) return null;

    let totalScore = 0;
    let scoreCount = 0;

    completedResults.forEach((result) => {
      const transcript = result?.conversation_transcript;
      if (transcript) {
        const feedback = transcript?.feedback || transcript;
        const ratings = feedback?.rating || feedback?.ratings;
        if (ratings) {
          const values = Object.values(ratings).filter(
            (v) => typeof v === 'number'
          );
          if (values.length > 0) {
            totalScore += values.reduce((a, b) => a + b, 0) / values.length;
            scoreCount++;
          }
        }
      }
    });

    return scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) : null;
  };

  const averageScore = calculateAverageScore();

  // Get interview status
  const getStatus = () => {
    if (completedResults.length === 0 && interviewResults.length === 0) {
      return { label: 'Active', color: 'violet', icon: Sparkles };
    }
    if (completedResults.length > 0 && pendingCount === 0) {
      return { label: 'Completed', color: 'emerald', icon: CheckCircle };
    }
    if (completedResults.length > 0) {
      return { label: 'In Progress', color: 'amber', icon: AlertCircle };
    }
    return { label: 'Active', color: 'violet', icon: Sparkles };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Get score color and label
  const getScoreInfo = (score) => {
    if (score >= 70) return { color: 'emerald', label: 'Excellent' };
    if (score >= 50) return { color: 'amber', label: 'Good' };
    return { color: 'red', label: 'Needs Review' };
  };

  const scoreInfo = averageScore !== null ? getScoreInfo(averageScore) : null;

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 w-full overflow-hidden h-full">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
        <div className="absolute inset-[1px] rounded-2xl bg-white -z-5" />

        <div
          className={`h-1.5 w-full bg-gradient-to-r ${status.color === 'emerald'
            ? 'from-emerald-400 via-teal-500 to-emerald-600'
            : status.color === 'amber'
              ? 'from-amber-400 via-orange-500 to-amber-600'
              : 'from-violet-400 via-purple-500 to-violet-600'
            }`}
        />

        <div className="p-5 sm:p-6 flex flex-col h-full">
          {/* HEADER GRID */}
          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
            {/* Row 1 – Left: Icon + Job Position */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-violet-500/20 rounded-xl blur-lg" />
                <div className="relative p-1 rounded-xl bg-violet-600 shadow-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 truncate capitalize">
                {interview?.job_position}
              </h2>
            </div>

            {/* Row 1 – Right: Status */}
            <div className="flex justify-end">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color === 'emerald'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : status.color === 'amber'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-violet-50 text-violet-700 border-violet-200'
                  }`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
                className="p-1.5 h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50
                         rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </Button>
            </div>

            {/* Row 2 – Left: Interview Types */}
            {interviewTypes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 max-h-[56px] overflow-hidden">
                {interviewTypes.map((type, idx) => (
                  <span
                    key={idx}
                    className="px-1 py-0.5 text-xs font-medium text-violet-700
                             bg-violet-50 border border-violet-100 rounded-md
                             whitespace-normal break-words"
                  >
                    {type}
                  </span>
                ))}

                {interviewTypes.length > 3 && (
                  <span className="text-xs font-medium text-gray-500">
                    +{interviewTypes.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Row 2 – Right: Score */}
            {scoreInfo && (
              <div className="flex flex-col items-center leading-tight">
                <span
                  className={`text-lg font-bold ${scoreInfo.color === 'emerald'
                    ? 'text-emerald-600'
                    : scoreInfo.color === 'amber'
                      ? 'text-amber-600'
                      : 'text-red-500'
                    }`}
                >
                  {averageScore}%
                </span>
                <span className="text-[11px] text-gray-400 mt-0">
                  {scoreInfo.label}
                </span>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-auto">
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                {moment(interview?.created_at).format('MMM DD, YYYY')}
              </div>

              <div className="w-px h-4 bg-gray-200" />

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                {interview?.duration}
              </div>

              <div className="w-px h-4 bg-gray-200" />

              <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
                <Users className="w-4 h-4" />
                {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {!viewDetail ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 py-2.5 rounded-xl"
                    onClick={copyLink}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>

                  {hasCompletedInterviews ? (
                    <Link
                      href={`/recruiter/scheduled-interview/${interview?.interview_id}/details`}
                      className="flex-1"
                    >
                      <Button className="w-full py-2.5 rounded-xl">
                        View Results
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="flex-1 py-2.5 rounded-xl"
                      onClick={onSend}
                    >
                      Send Invite
                    </Button>
                  )}
                </>
              ) : (
                <Link
                  href={`/recruiter/scheduled-interview/${interview?.interview_id}/details`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full py-2.5 rounded-xl">
                    View Details
                  </Button>
                </Link>
              )}


            </div>
          </div>
        </div>
      </div>
    </>
  );


}

export default InterviewCard;
