import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Linkedin,
  List,
  Mail,
  Phone,
  Plus,
  CheckCircle2,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const InterviewLink = ({ interview_id, formData }) => {
  const router = useRouter();

  // Get clean base URL (remove trailing slash if present)
  const baseUrl = process.env.NEXT_PUBLIC_HOST_URL.replace(/\/$/, '');
  // Construct full interview URL
  const url = `${baseUrl}/interview/${interview_id}`;

  const getInterviewURL = () => {
    return url;
  };

  const expiresAt = () => {
    const futureDate = new Date(
      new Date(
        formData?.created_at || '2025-04-14 19:09:50.492361+00'
      ).getTime() +
        30 * 24 * 60 * 60 * 1000
    );
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return futureDate.toLocaleDateString('en-US', options);
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success('Interview link copied!');
  };

  const shareVia = (platform) => {
    const interviewTitle = formData?.title || 'AI Interview';
    const defaultMessage = `Join my ${interviewTitle} interview: ${url}`;
    const emailSubject = `Invitation to ${interviewTitle}`;
    const emailBody = `Dear Candidate,

I hope this message finds you well. I am pleased to invite you to participate in my ${interviewTitle}. This interview is designed to assess your skills and provide an opportunity to showcase your expertise.

You can access the interview using the following link:
${url}

Please ensure you complete the interview before the deadline. If you have any questions or require assistance, feel free to reach out.

Looking forward to your responses!

Best regards,
`;

    let shareUrl = '';

    switch (platform) {
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = shareUrl;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`;
        window.open(shareUrl, '_blank');
        break;
      default:
        break;
    }

    // Track sharing event if analytics are set up
    // analytics.track('Interview Shared', { platform, interview_id });
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto py-8">
      {/* Success Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-2xl opacity-40 animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 ring-4 ring-green-100">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="font-bold text-2xl text-gray-900">
          Your AI Interview is Ready!
        </h2>
        <p className="mt-2 text-gray-500 text-sm max-w-md">
          Share this link with candidates to start the interview process. They
          can begin anytime before the expiration date.
        </p>
      </div>

      {/* Interview Link Card */}
      <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-6 w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-violet-500 to-violet-500" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-violet-600" />
            <h2 className="font-semibold text-gray-900">Interview Link</h2>
          </div>
          <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-medium px-3 py-1.5">
            ✓ Valid for 30 days
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              value={getInterviewURL()}
              readOnly
              className="bg-gray-50 border-gray-200 pr-10 text-sm font-mono text-gray-600"
            />
          </div>
          <Button onClick={onCopyLink} variant="gradient" className="shrink-0">
            <Copy className="size-4" />
            Copy Link
          </Button>
        </div>

        {/* Interview Details */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Clock className="size-5 text-violet-500 mb-1.5" />
              <span className="text-xs text-gray-500">Duration</span>
              <span className="text-sm font-semibold text-gray-900">
                {formData.duration || '30 min'}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <List className="size-5 text-violet-500 mb-1.5" />
              <span className="text-xs text-gray-500">Questions</span>
              <span className="text-sm font-semibold text-gray-900">
                {formData?.questList?.length || '10'}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Calendar className="size-5 text-violet-500 mb-1.5" />
              <span className="text-xs text-gray-500">Expires</span>
              <span className="text-sm font-semibold text-gray-900">
                {expiresAt()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Options */}
      <div className="w-full bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-4 h-4 text-violet-600" />
          <h2 className="font-semibold text-gray-900">Share Interview</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => shareVia('email')}
            className="flex-col h-auto py-4 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
          >
            <Mail className="size-5 mb-1.5" />
            <span className="text-xs font-medium">Email</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => shareVia('linkedin')}
            className="flex-col h-auto py-4 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
          >
            <Linkedin className="size-5 mb-1.5" />
            <span className="text-xs font-medium">LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => shareVia('whatsapp')}
            className="flex-col h-auto py-4 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all"
          >
            <Phone className="size-5 mb-1.5" />
            <span className="text-xs font-medium">WhatsApp</span>
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push('/recruiter/dashboard')}
          className="h-12"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Button>
        <Button
          onClick={() => router.push('/recruiter/dashboard/create-interview')}
          variant="gradient"
          size="lg"
          className="h-12"
        >
          <Plus className="size-4" /> Create New Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewLink;
