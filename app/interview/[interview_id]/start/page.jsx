'use client';

import { InterviewDataContext } from '@/context/InterviewDataContext';
import { Timer, Phone, Clock, Video } from 'lucide-react';
import Image from 'next/image';
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import AlertConfirmation from './_components/AlertConfirmation';
import VideoPanel from './_components/VideoPanel';
import axios from 'axios';
import TimmerComponent from './_components/TimmerComponent';
import { getVapiClient } from '@/lib/vapiconfig';
import { supabase } from '@/services/supabaseClient';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DB_TABLES } from '@/services/Constants';
import { logger } from '@/lib/logger';

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const vapi = getVapiClient();
  const [activeUser, setActiveUser] = useState(false);
  const [start, setStart] = useState(false);
  const [subtitles, setSubtitles] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const conversation = useRef(null);
  const { interview_id } = useParams();

  // Auto-disconnect countdown state
  const [showEndCountdown, setShowEndCountdown] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const countdownRef = useRef(null);

  const router = useRouter();
  const [userProfile] = useState({
    picture: null,
    name: interviewInfo?.candidate_name || 'Candidate',
  });
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Restore interviewInfo from localStorage if missing

  useEffect(() => {
    if (!interviewInfo && typeof window !== 'undefined') {
      const stored = localStorage.getItem('interviewInfo');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.interview_id === interview_id) {
            setInterviewInfo(parsed);
          } else {
            // interview_id mismatch, clear
            localStorage.removeItem('interviewInfo');
            router.replace(`/interview/${interview_id}`);
          }
        } catch {
          localStorage.removeItem('interviewInfo');
          router.replace(`/interview/${interview_id}`);
        }
      } else {
        // No info, redirect to join page
        router.replace(`/interview/${interview_id}`);
      }
    }
  }, [interviewInfo, interview_id, setInterviewInfo, router]);

  const startCall = async () => {
    const job_position = interviewInfo?.job_position || 'Unknown Position';
    // Use the generated questions for this candidate
    const question_list =
      interviewInfo?.question_list?.interviewQuestions?.map(
        (question) => question?.question
      ) || [];

    logger.log('job_position:', job_position);
    logger.log('question_list:', question_list);

    const assistantOptions = {
      name: 'AI Recruiter',
      firstMessage: `Hi ${interviewInfo?.candidate_name}, how are you? Ready for your interview on ${interviewInfo?.job_position}?`,
      transcriber: {
        provider: 'deepgram',
        model: 'nova-3',
        language: 'en-US',
      },
      voice: {
        provider: 'playht',
        voiceId: 'jennifer',
      },
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `
You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey ${interviewInfo?.candidate_name}! Welcome to your ${interviewInfo?.job_position} interview. Let's get started with a few questions!"
Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below Are the questions ask one by one:
Questions: ${question_list}
If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That's a solid answer."
"Hmm, not quite! Want to try again?"
Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
After 5-7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"
Key Guidelines:
✅ Be friendly, engaging, and witty 🎤
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ Ensure the interview remains focused on React
`.trim(),
          },
        ],
      },
    };

    vapi.start(assistantOptions);
  };

  useEffect(() => {
    logger.log('interviewInfo:', interviewInfo);
    if (interviewInfo && interviewInfo?.job_position && vapi && !start) {
      setStart(true);
      startCall();
    }
  }, [interviewInfo, vapi, start]);

  useEffect(() => {
    if (!vapi) return;
    // Set up event listeners for Vapi events
    const handleMessage = (message) => {
      if (message?.role === 'assistant' && message?.content) {
        setSubtitles(message.content);

        // Check if AI is wrapping up the interview (detect farewell phrases)
        const content = message.content.toLowerCase();
        const farewellPhrases = [
          'thanks for chatting',
          'thank you for your time',
          'that concludes',
          'interview is complete',
          'good luck',
          'best of luck',
          "we'll be in touch",
          'hope to see you',
          'that was great',
          'end of the interview',
          'wrapping up',
        ];

        const isEnding = farewellPhrases.some((phrase) =>
          content.includes(phrase)
        );
        if (isEnding && !showEndCountdown) {
          // Start the countdown for auto-disconnect
          setShowEndCountdown(true);
          setCountdown(30);
        }
      }

      if (message && message?.conversation) {
        const filteredConversation =
          message.conversation.filter((msg) => msg.role !== 'system') || '';
        const conversationString = JSON.stringify(
          filteredConversation,
          null,
          2
        );
        conversation.current = conversationString;
      }
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
      setActiveUser(false);
      toast('AI is speaking...');
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setActiveUser(true);
    };

    vapi.on('message', handleMessage);
    vapi.on('call-start', () => {
      toast('Call started...');
      setStart(true);
    });
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('call-end', () => {
      // Clear countdown if running
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      toast('Call has ended. Generating feedback...');
      setIsGeneratingFeedback(true);
      GenerateFeedback();
    });

    return () => {
      vapi.off('message', handleMessage);
      vapi.off('call-start', () => { });
      vapi.off('speech-start', handleSpeechStart);
      vapi.off('speech-end', handleSpeechEnd);
      vapi.off('call-end', () => { });
    };
  }, [vapi]);

  // Countdown timer effect for auto-disconnect
  useEffect(() => {
    if (showEndCountdown && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            // Auto-disconnect
            vapi.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [showEndCountdown, vapi]);

  const stopInterview = () => {
    // Clear countdown if running
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    vapi.stop();
  };

  const GenerateFeedback = async () => {
    if (!interviewInfo || !conversation.current) {
      toast.error('Interview data missing. Please restart the interview.');
      router.replace(`/interview/${interview_id}`);
      return;
    }
    try {
      const result = await axios.post('/api/ai-feedback', {
        conversation: conversation.current,
      });

      // API returns { vendor, model, feedback } - feedback is already parsed JSON
      const feedbackData = result?.data?.feedback;

      if (!feedbackData) throw new Error('Feedback content is empty');

      logger.log('Feedback Data:', feedbackData);

      // feedbackData is already a parsed object from the API
      // It may have a nested 'feedback' object or be the feedback directly
      const parsedTranscript = feedbackData?.feedback || feedbackData;

      const { error: insertError } = await supabase
        .from(DB_TABLES.INTERVIEW_RESULTS)
        .insert([
          {
            fullname: interviewInfo?.candidate_name,
            email: interviewInfo?.email,
            interview_id: interview_id,
            conversation_transcript: parsedTranscript,
            recommendations: 'Not recommended',
            completed_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        logger.error('Supabase insert error:', insertError);
        throw new Error('Insert failed');
      }

      // After saving feedback, generate new questions for the next candidate
      try {
        const aiResult = await axios.post('/api/ai-model', {
          job_position: interviewInfo?.job_position,
          job_description: interviewInfo?.job_description,
          duration: interviewInfo?.duration,
          type: interviewInfo?.type,
        });
        const rawContent = aiResult?.data?.content || aiResult?.data?.Content;
        let newQuestions = null;
        if (rawContent) {
          const match = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
          if (match && match[1]) {
            newQuestions = JSON.parse(match[1].trim());
          }
        }
        if (newQuestions) {
          // Update the interview's question_list in Supabase
          await supabase
            .from(DB_TABLES.INTERVIEWS)
            .update({ question_list: newQuestions })
            .eq('interview_id', interview_id);
        }
      } catch (e) {
        logger.error(
          'Failed to generate or update new questions for next candidate',
          e
        );
      }

      toast.success('Feedback generated successfully!');

      // Stop all media streams before leaving
      try {
        // Find and stop all active media streams
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject;
            stream.getTracks().forEach(track => {
              track.stop();
              logger.log('Stopped media track:', track.kind);
            });
            video.srcObject = null;
          }
        });
      } catch (e) {
        logger.error('Error stopping media streams:', e);
      }

      // Clear localStorage to avoid stale data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('interviewInfo');

        // Force full page reload to completely destroy all media streams
        // Using window.location.href instead of router.replace ensures
        // React components are fully unmounted and streams are released
        setTimeout(() => {
          window.location.href = '/interview/' + interviewInfo?.interview_id + '/completed';
        }, 100);
      }
    } catch (error) {
      logger.error('Feedback generation failed:', error);
      toast.error('Failed to generate feedback');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Professional Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent">
              {interviewInfo?.job_position || 'AI'} Interview Session
            </h1>
            <p className="text-gray-600">Powered by AI Interview Assistant</p>
          </div>

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg border border-violet-100/50">
            <div className="p-2 rounded-lg bg-violet-100">
              <Timer className="text-violet-600" />
            </div>
            <span className="font-mono text-lg font-semibold bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent">
              <TimmerComponent start={start} />
            </span>
          </div>
        </header>

        {/* Interview Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI Recruiter Panel */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 transition-all duration-500 min-h-80 flex flex-col ${isSpeaking ? 'border-violet-400 ring-4 ring-violet-100 shadow-violet-200' : 'border-gray-100'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-violet-100">
                <Video className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                AI Interviewer
              </span>
              {isSpeaking && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-violet-100 text-violet-600 rounded-full animate-pulse">
                  Speaking...
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full bg-violet-100 animate-ping opacity-75"></div>
                )}
                <div
                  className={`relative z-10 w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg transition-all duration-300 ${isSpeaking ? 'border-violet-400 shadow-violet-200' : 'border-white'} bg-violet-100`}
                >
                  <Image
                    src="/AIR.png"
                    alt="AI Recruiter"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                {/* Sound wave animation when speaking */}
                {isSpeaking && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-violet-500 rounded-full animate-bounce"
                        style={{
                          height: `${8 + Math.random() * 12}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.5s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  AI Recruiter
                </h2>
                <p className="text-sm text-violet-500 font-medium">
                  Interview Assistant
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Video Panel */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border-2 transition-all duration-500 min-h-80 ${activeUser ? 'border-violet-400 ring-4 ring-violet-100 shadow-violet-200' : 'border-gray-100'}`}
          >
            <VideoPanel
              userName={userProfile.name}
              isInterviewActive={start}
              onCameraError={(error) => {
                logger.error('Camera error:', error);
                toast.error(error);
              }}
              onFaceNotDetected={() => {
                logger.warn('Face not detected');
              }}
              onExitInterview={(reason) => {
                logger.log('Exit interview:', reason);
                toast.error(`Interview ended: ${reason}`);
                stopInterview();
              }}
            />
          </div>
        </div>

        {/* Subtitles Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-6 shadow-lg border border-violet-100/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-violet-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-violet-600"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">
              Live Transcription
            </span>
            {isSpeaking && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-violet-600">
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
                AI Speaking
              </span>
            )}
          </div>
          <div className="min-h-20 flex items-center justify-center bg-gray-50/50 rounded-xl p-4">
            {subtitles ? (
              <p className="text-center text-gray-700 animate-fadeIn text-lg leading-relaxed">
                &ldquo;{subtitles}&rdquo;
              </p>
            ) : (
              <p className="text-center text-gray-400 italic">
                {isSpeaking ? 'AI is speaking...' : 'Waiting for response...'}
              </p>
            )}
          </div>
        </div>

        {/* Auto-disconnect Countdown Banner */}
        {showEndCountdown && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 shadow-lg animate-fade-in">
            <div className="flex items-center justify-center gap-4">
              <div className="p-2 rounded-full bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-center">
                <p className="text-amber-800 font-medium">
                  Interview is wrapping up. Auto-disconnecting in{' '}
                  <span className="font-bold text-amber-600">{countdown}s</span>
                </p>
                <p className="text-sm text-amber-600">
                  Click &quot;End Interview&quot; to finish now
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-violet-100/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${start ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}
              ></div>
              <span className="text-sm font-medium text-gray-600">
                {start ? 'Interview in progress' : 'Connecting...'}
              </span>
            </div>

            {/* End Interview Button */}
            <div className="flex items-center gap-4">
              <AlertConfirmation stopInterview={stopInterview}>
                <button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 shadow-lg shadow-rose-500/25 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 font-medium"
                  aria-label="End call"
                >
                  <Phone size={20} className="rotate-135" />
                  <span>End Interview</span>
                </button>
              </AlertConfirmation>
            </div>

            {/* Status text */}
            <p className="text-sm text-gray-500 hidden sm:block">
              {showEndCountdown
                ? `Disconnecting in ${countdown}s...`
                : activeUser
                  ? '🎤 Your turn to speak'
                  : '🤖 AI is speaking'}
            </p>
          </div>
        </div>
      </div>
      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-10 max-w-md w-full text-center shadow-2xl border border-violet-100">
            <div className="relative mx-auto mb-6">
              <div className="absolute -inset-3 bg-gradient-to-r from-violet-500 to-violet-500 rounded-full blur opacity-30 animate-pulse" />
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent mb-2">
              Generating Feedback
            </h2>
            <p className="text-gray-600">
              Please wait while we analyze your interview...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartInterview;
