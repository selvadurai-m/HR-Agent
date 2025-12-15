'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import FormContainer from './_components/FormContainer';
import QuestionList from './_components/QuestionList';
import { toast } from 'sonner';
import InterviewLink from './_components/InterviewLink';
import { useUser } from '@/app/provider';

function CreateInterview() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [interviewId, setInterviewId] = useState();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  // Check credits when component mounts and when user chan s
  useEffect(() => {
    if (user && user.credits <= 0) {
      toast.error("You don't have enough credits to create an interview");
      router.push('/recruiter/billing');
    }
  }, [user, router]);

  const onHandleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const onGoToNext = () => {
    // First check credits
    if (user?.credits <= 0) {
      toast.error('Please purchase credits to create an interview');
      router.push('/recruiter/billing');
      return;
    }

    // Then validate form fields
    let missingField = '';
    if (!formData.job_position) missingField = 'Job Position';
    else if (!formData.job_description) missingField = 'Job Description';
    else if (!formData.duration) missingField = 'Duration';
    else if (!formData.type) missingField = 'Interview Type';

    if (missingField) {
      toast.error(`${missingField} is required`);
      return;
    }

    setStep(step + 1);
  };

  const onCreateLink = async (interview_id) => {
    setLoading(true);

    // Double-check credits before proceeding
    if (user?.credits <= 0) {
      toast.error('Please purchase credits to create an interview');
      router.push('/recruiter/billing');
      setLoading(false);
      return;
    }

    try {
      setInterviewId(interview_id);
      setStep(step + 1);
    } catch (error) {
      toast.error('Failed to create interview link');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-600 to-violet-600 rounded-xl shadow-lg shadow-violet-500/20">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Interview
            </h1>
            <p className="text-sm text-gray-500">
              Set up your AI-powered interview
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Questions' },
            { num: 3, label: 'Share' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step >= s.num
                      ? 'bg-gradient-to-br from-violet-600 to-violet-600 text-white shadow-lg shadow-violet-500/30'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s.num}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-violet-600' : 'text-gray-400'}`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-1 mx-3 rounded-full transition-all ${
                    step > s.num
                      ? 'bg-gradient-to-r from-violet-600 to-violet-600'
                      : 'bg-gray-100'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {step === 1 && (
          <FormContainer
            onHandleInputChange={onHandleInputChange}
            GoToNext={onGoToNext}
          />
        )}

        {step === 2 && (
          <QuestionList
            formData={formData}
            onCreateLink={onCreateLink}
            loading={loading}
          />
        )}

        {step === 3 && (
          <InterviewLink interview_id={interviewId} formData={formData} />
        )}
      </div>
    </div>
  );
}

export default CreateInterview;
