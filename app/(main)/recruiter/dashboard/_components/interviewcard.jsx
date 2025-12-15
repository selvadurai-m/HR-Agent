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
    return `${baseUrl}/${interview?.interview_id}`;
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
      <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 w-full overflow-hidden">
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
        <div className="absolute inset-[1px] rounded-2xl bg-white -z-5" />

        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${
            status.color === 'emerald'
              ? 'from-emerald-400 via-teal-500 to-emerald-600'
              : status.color === 'amber'
                ? 'from-amber-400 via-orange-500 to-amber-600'
                : 'from-violet-400 via-purple-500 to-violet-600'
          }`}
        />

        <div className="p-5 sm:p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Icon + Title */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Animated Icon */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-violet-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                <div className="relative p-3.5 rounded-xl bg-gradient-to-br from-violet-600 to-violet-600 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Title + Type Tags */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-violet-700 transition-colors truncate capitalize">
                  {interview?.job_position}
                </h2>

                {/* Interview Type Tags */}
                {interviewTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {interviewTypes.slice(0, 3).map((type, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-violet-700 bg-violet-50 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors"
                      >
                        {type}
                      </span>
                    ))}
                    {interviewTypes.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                        +{interviewTypes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-start gap-2 shrink-0">
              {/* Status Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  status.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : status.color === 'amber'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-violet-50 text-violet-700 border-violet-200'
                }`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </div>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
                className="p-2 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {moment(interview?.created_at).format('MMM DD, YYYY')}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{interview?.duration}</span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            {/* Candidates */}
            <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
              <Users className="w-4 h-4" />
              <span>
                {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Score Badge - Right aligned */}
            {scoreInfo && (
              <div className="ml-auto flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    scoreInfo.color === 'emerald'
                      ? 'text-emerald-500'
                      : scoreInfo.color === 'amber'
                        ? 'text-amber-500'
                        : 'text-red-500'
                  }`}
                />
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${
                      scoreInfo.color === 'emerald'
                        ? 'text-emerald-600'
                        : scoreInfo.color === 'amber'
                          ? 'text-amber-600'
                          : 'text-red-500'
                    }`}
                  >
                    {averageScore}%
                  </span>
                  <p className="text-xs text-gray-400">{scoreInfo.label}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            {!viewDetail ? (
              <>
                {/* Copy Link Button */}
                <Button
                  variant="outline"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border-gray-200 ${
                    copied
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                      : 'hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600'
                  }`}
                  onClick={copyLink}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>

                {/* Primary Action Button */}
                {hasCompletedInterviews ? (
                  <Link
                    href={`/recruiter/scheduled-interview/${interview?.interview_id}/details`}
                    className="flex-1"
                  >
                    <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]">
                      <Eye size={16} />
                      <span>View Results</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]"
                    onClick={onSend}
                  >
                    <Send size={16} />
                    <span>Send Invite</span>
                  </Button>
                )}
              </>
            ) : (
              <Link
                href={`/recruiter/scheduled-interview/${interview?.interview_id}/details`}
                className="w-full"
              >
                <Button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-gray-200 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all font-medium group/btn"
                  variant="outline"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Delete Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Delete Interview
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete the interview for{' '}
                  <strong className="text-gray-900">
                    {interview?.job_position}
                  </strong>
                  ?
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-sm text-red-700 font-medium mb-2">
                    This action cannot be undone. You will lose:
                  </p>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      The interview link
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {interview['interview_results']?.length || 0} candidate
                      responses
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      All feedback and ratings
                    </li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel disabled={deleting} className="rounded-xl px-5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                'Delete Interview'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default InterviewCard;
