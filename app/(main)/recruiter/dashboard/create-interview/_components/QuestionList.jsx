'use client';
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import {
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  SparklesIcon,
  CreditCardIcon,
  MessageSquareQuoteIcon,
} from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/services/supabaseClient';
import { DB_TABLES } from '@/services/Constants';

function QuestionList({ formData, onCreateLink }) {
  const [loading, setLoading] = useState(true);
  const [question_list, setQuestionList] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('behavioral');
  const { user, updateUserCredits } = useUser();
  const hasCalled = useRef(false);

  // Debugging useEffect - logs whenever question_list changes

  useEffect(() => {
    console.log('Current question_list state:', question_list);
  }, [question_list]);

  const GenerateQuestionList = useCallback(async () => {
    setLoading(true);
    hasCalled.current = true;
    try {
      console.log('Making API call to generate questions...');
      const result = await axios.post('/api/ai-model', {
        ...formData,
      });

      console.log('API response received:', result.data);

      // Handle the response - API returns { vendor, model, questions }
      const responseData = result?.data;

      if (!responseData) {
        toast('Invalid response format');
        console.error('No response data received');
        return;
      }

      // Check if questions are directly available (parsed JSON)
      if (responseData.questions) {
        // If questions is already an object/array, use it directly
        if (
          typeof responseData.questions === 'object' &&
          !responseData.questions.raw
        ) {
          console.log('Parsed question data:', responseData.questions);
          setQuestionList(responseData.questions);
          return;
        }

        // If it has a 'raw' field, try to parse it
        if (responseData.questions.raw) {
          const rawContent = responseData.questions.raw;

          // Try markdown code block first
          const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (match && match[1]) {
            try {
              const parsedData = JSON.parse(match[1].trim());
              console.log('Parsed question data from code block:', parsedData);
              setQuestionList(parsedData);
              return;
            } catch {
              console.log(
                'Failed to parse code block JSON, trying other methods'
              );
            }
          }

          // Try to find JSON object in the raw content
          const objectMatch = rawContent.match(
            /(\{[\s\S]*"interviewQuestions"[\s\S]*\})/
          );
          if (objectMatch && objectMatch[1]) {
            try {
              const parsedData = JSON.parse(objectMatch[1]);
              console.log(
                'Parsed question data from embedded object:',
                parsedData
              );
              setQuestionList(parsedData);
              return;
            } catch {
              console.log('Failed to parse embedded object');
            }
          }

          // Try direct JSON parse
          try {
            const parsedData = JSON.parse(rawContent);
            console.log('Parsed question data directly:', parsedData);
            setQuestionList(parsedData);
            return;
          } catch {
            console.error('Failed to parse raw content as JSON');
          }

          // Last resort: try to extract any JSON-like structure
          const anyJsonMatch = rawContent.match(/(\{[\s\S]*\})/);
          if (anyJsonMatch && anyJsonMatch[1]) {
            try {
              const parsedData = JSON.parse(anyJsonMatch[1]);
              console.log(
                'Parsed question data from any JSON match:',
                parsedData
              );
              setQuestionList(parsedData);
              return;
            } catch {
              console.error('All JSON parsing attempts failed');
            }
          }
        }
      }

      // Fallback: check for legacy content field
      const rawContent = responseData.content || responseData.Content;
      if (rawContent) {
        const match = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          const parsedData = JSON.parse(match[1].trim());
          console.log('Parsed question data:', parsedData);
          setQuestionList(parsedData);
          return;
        }
      }

      toast('Failed to extract question list');
      console.error('Could not parse questions from response:', responseData);
    } catch (e) {
      toast('Server Error, Try Again');
      console.error('Error generating questions:', e);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    if (formData && !hasCalled.current) {
      console.log('Initial formData received:', formData);
      GenerateQuestionList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast('Please enter a question');
      return;
    }

    console.log('Attempting to add new question:', {
      question: newQuestion,
      type: newQuestionType,
    });

    setQuestionList((prev) => {
      if (!prev || !prev.interviewQuestions) {
        console.error('Invalid previous state:', prev);
        return prev;
      }

      const newQuestionObj = {
        question: newQuestion,
        type: newQuestionType,
      };

      const newState = {
        ...prev,
        interviewQuestions: [...prev.interviewQuestions, newQuestionObj],
      };

      console.log('New state after addition:', newState);
      return newState;
    });

    setNewQuestion('');
    setNewQuestionType('behavioral');
    toast('Question added successfully');
  };

  const handleDeleteQuestion = (index) => {
    console.log('Attempting to delete question at index:', index);

    setQuestionList((prev) => {
      if (
        !prev ||
        !prev.interviewQuestions ||
        index >= prev.interviewQuestions.length
      ) {
        console.error('Invalid deletion index or state:', {
          index,
          state: prev,
        });
        return prev;
      }

      const updatedQuestions = [...prev.interviewQuestions];
      updatedQuestions.splice(index, 1);

      const newState = {
        ...prev,
        interviewQuestions: updatedQuestions,
      };

      console.log('New state after deletion:', newState);
      return newState;
    });

    toast('Question deleted successfully');
  };

  const onFinish = async () => {
    setSaveLoading(true);
    const interview_id = uuidv4();

    console.log('Final question list being saved:', question_list);
    console.log('Form data being saved:', formData);

    try {
      // First, deduct credit from user
      const currentCredits = user?.credits || 0;
      if (currentCredits <= 0) {
        toast.error("You don't have enough credits to create an interview");
        setSaveLoading(false);
        return;
      }

      const newCredits = currentCredits - 1;
      const creditUpdateResult = await updateUserCredits(newCredits);

      if (!creditUpdateResult.success) {
        toast.error('Failed to deduct credit. Please try again.');
        setSaveLoading(false);
        return;
      }

      // Then create the interview
      const { data, error } = await supabase
        .from(DB_TABLES.INTERVIEWS)
        .insert([
          {
            ...formData,
            question_list: question_list,
            email: user?.email,
            interview_id: interview_id,
          },
        ])
        .select();

      console.log('Supabase insert result:', { data, error });

      setSaveLoading(false);
      onCreateLink(interview_id);

      if (error) {
        toast('Failed to save interview');
        console.error('Supabase error:', error);
        // Revert credit deduction if interview creation failed
        await updateUserCredits(currentCredits);
      } else {
        toast.success(
          `Interview saved successfully! Credit deducted. You now have ${newCredits} credits remaining.`
        );
      }
    } catch (e) {
      console.error('Error saving interview:', e);
      toast('Error saving interview');
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {loading && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-600 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative p-4 bg-gradient-to-br from-violet-600 to-violet-600 rounded-full">
              <Loader2Icon className="animate-spin w-8 h-8 text-white" />
            </div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 items-center text-center max-w-md">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-violet-600" />
              <h2 className="font-semibold text-lg text-gray-900">
                Generating Interview Questions
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Our AI is crafting personalized questions based on your job
              position and requirements
            </p>
          </div>
        </div>
      )}

      {!loading && question_list && question_list.interviewQuestions && (
        <div className="py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generated Questions
            </h2>
            <p className="text-gray-500 text-sm">
              Review and customize your interview questions
            </p>
          </div>

          {/* Credit Info Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-4 px-5 py-3 bg-white rounded-full border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4 text-violet-600" />
                <span className="text-sm text-gray-600">
                  Credits Remaining:
                </span>
                <span className="font-bold text-violet-600">
                  {user?.credits || 0}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="text-sm text-gray-500">
                Cost:{' '}
                <span className="font-medium text-gray-700">1 Credit</span>
              </div>
            </div>
          </div>

          {/* Add Question Form */}
          <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareQuoteIcon className="w-4 h-4 text-violet-600" />
              <h3 className="font-semibold text-gray-900">
                Add Custom Question
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-sm"
              />
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-sm min-w-35"
              >
                <option value="behavioral">Behavioral</option>
                <option value="technical">Technical</option>
                <option value="situational">Situational</option>
                <option value="cultural">Cultural Fit</option>
              </select>
              <Button onClick={handleAddQuestion} variant="gradient">
                <PlusIcon className="w-4 h-4" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {question_list.interviewQuestions.map((item, index) => (
              <div
                key={index}
                className="group p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-violet-600 text-white text-sm font-medium flex items-center justify-center shadow-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 leading-relaxed">
                          {item.question}
                        </p>
                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 capitalize">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Delete question"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
            <Button
              onClick={onFinish}
              disabled={saveLoading || (user?.credits || 0) <= 0}
              size="lg"
              variant={user?.credits <= 0 ? 'secondary' : 'gradient'}
              className={
                user?.credits <= 0 ? 'cursor-not-allowed opacity-60' : ''
              }
            >
              {saveLoading ? (
                <>
                  <Loader2Icon className="animate-spin w-4 h-4" />
                  Saving...
                </>
              ) : user?.credits <= 0 ? (
                'No Credits Available'
              ) : (
                'Create Interview Link & Finish'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionList;
