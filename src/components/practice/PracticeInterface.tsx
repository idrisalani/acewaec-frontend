import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Loader2, Flag, Home, ChevronLeft, ChevronRight, Pause, Play, CheckCircle } from 'lucide-react';
import { practiceService } from '../../services/practice.service';
import apiClient from '../../services/api';

interface Option {
  id: string;
  label: string;
  content: string;
}

interface Question {
  id: string;
  content: string;
  imageUrl?: string;
  difficulty: string;
  subject: { name: string };
  options: Option[];
}

interface Session {
  id: string;
  duration?: number;
}

export default function PracticeInterface() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const hasAutoSubmitted = useRef(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const pauseStartTime = useRef<number | null>(null);


  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!session || isSubmitting) return;
    if (isAutoSubmit && hasAutoSubmitted.current) return;
    if (isAutoSubmit) hasAutoSubmitted.current = true;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (Object.keys(answers).length === 0 && !isAutoSubmit) {
        if (!confirm('You haven\'t answered any questions. Submit anyway?')) {
          setIsSubmitting(false);
          return;
        }
      }

      const submitPromises = Object.entries(answers).map(([questionId, answer]) =>
        practiceService.submitAnswer(session.id, questionId, answer).catch(err => {
          console.error(`Failed to submit answer for question ${questionId}:`, err);
          return null;
        })
      );

      await Promise.all(submitPromises);
      await practiceService.completeSession(session.id);
      const resultsResponse = await apiClient.get(`/practice/sessions/${session.id}/results`);
      localStorage.removeItem('currentPracticeSession');
      navigate(`/practice/${session.id}/results`, {
        state: resultsResponse.data.data,
        replace: true
      });
    } catch (error) {
      console.error('Submission error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string }; status?: number } };
        const status = axiosError.response?.status;
        const errorMessage = axiosError.response?.data?.error || 'Unknown error';

        if (status === 404) setSubmitError('Session not found');
        else if (status === 401) {
          setSubmitError('Session expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else setSubmitError(`Failed: ${errorMessage}`);
      } else {
        setSubmitError('Network error. Check your connection.');
      }
      setIsSubmitting(false);
      if (isAutoSubmit) hasAutoSubmitted.current = false;
    }
  }, [session, isSubmitting, answers, navigate]);

  useEffect(() => {
    const sessionData = localStorage.getItem('currentPracticeSession');
    if (sessionData) {
      try {
        const data = JSON.parse(sessionData);
        setSession(data.session);
        setQuestions(data.questions);
        setTimeLeft((data.session?.duration || 60) * 60);
      } catch (error) {
        console.error('Failed to parse session data:', error);
        navigate('/practice/setup');
      } finally {
        setLoading(false);
      }
    } else {
      navigate('/practice/setup');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1 && !hasAutoSubmitted.current) {
          handleSubmit(true);
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit, isPaused]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const toggleFlag = async (questionId: string) => {
    if (!session) return;
    const newFlagged = new Set(flaggedQuestions);
    const isFlagged = !flaggedQuestions.has(questionId);

    if (isFlagged) newFlagged.add(questionId);
    else newFlagged.delete(questionId);

    setFlaggedQuestions(newFlagged);

    try {
      await practiceService.toggleFlag(session.id, questionId, isFlagged);
    } catch (error) {
      console.error('Failed to toggle flag:', error);
      setFlaggedQuestions(flaggedQuestions);
    }
  };

  const handlePause = async () => {
    if (!session || isPaused) return;
    setIsPaused(true);
    pauseStartTime.current = Date.now();
    try {
      await practiceService.pauseSession(session.id);
    } catch (error) {
      console.error('Failed to pause:', error);
      setIsPaused(false);
    }
  };

  const handleResume = async () => {
    if (!session || !isPaused) return;
    setIsPaused(false);
    try {
      await practiceService.resumeSession(session.id);
    } catch (error) {
      console.error('Failed to resume:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading practice session...</p>
        </div>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isTimeCritical = timeLeft < 300;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <AlertCircle className="text-orange-500 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Exit Practice?</h3>
            <p className="text-gray-600 text-center mb-6">Your progress will be lost. Are you sure?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold"
              >
                Continue
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <Home size={20} />
              <span className="hidden sm:inline font-medium">Exit</span>
            </button>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${isTimeCritical ? 'bg-red-100 text-red-700 animate-pulse' :
                timeLeft < 600 ? 'bg-orange-100 text-orange-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                <Clock size={20} />
                {formatTime(timeLeft)}
              </div>

              <button
                onClick={isPaused ? handleResume : handlePause}
                className={`p-2 rounded-xl transition-colors ${isPaused ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>
            </div>
          </div>

          {submitError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-600 mt-0.5" size={18} />
              <p className="text-red-800 text-sm flex-1">{submitError}</p>
              <button onClick={() => setSubmitError(null)} className="text-red-600 text-xs">✕</button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
              <span>{Object.keys(answers).length}/{questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Question {currentIndex + 1}/{questions.length}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentQuestion.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {currentQuestion.subject.name}
                  </span>
                </div>

                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-lg ${flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <Flag size={18} fill={flaggedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <p className="text-lg md:text-xl text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.content}
              </p>

              {currentQuestion.imageUrl && (
                <img src={currentQuestion.imageUrl} alt="Question" className="mb-6 rounded-lg border" />
              )}

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.label)}
                    disabled={isPaused}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion.id] === option.label
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${answers[currentQuestion.id] === option.label
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {option.label}
                      </div>
                      <span className="flex-1">{option.content}</span>
                      {answers[currentQuestion.id] === option.label && (
                        <CheckCircle className="text-indigo-600" size={24} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between gap-4">
                <button
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="font-bold mb-4">Questions</h3>

              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="text-green-600 mx-auto mb-1" size={20} />
                  <p className="text-xs text-gray-600">Answered</p>
                  <p className="text-lg font-bold text-green-600">{Object.keys(answers).length}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <Flag className="text-yellow-600 mx-auto mb-1" size={20} />
                  <p className="text-xs text-gray-600">Flagged</p>
                  <p className="text-lg font-bold text-yellow-600">{flaggedQuestions.size}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square rounded-lg font-bold text-sm transition-all ${idx === currentIndex ? 'ring-2 ring-indigo-600 scale-110' : ''
                      } ${answers[q.id] ? 'bg-green-100 text-green-700' :
                        flaggedQuestions.has(q.id) ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
            <p className="text-gray-900 font-bold text-lg">Submitting...</p>
            <p className="text-gray-600 text-sm">Please wait</p>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Paused</h2>
            <p className="text-gray-600 mb-6">Take a break. Your progress is saved.</p>
            <button
              onClick={handleResume}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              Resume Practice
            </button>
          </div>
        </div>
      )}

      {/* Time Warning */}
      {isTimeCritical && timeLeft > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-semibold">Less than 5 minutes!</span>
          </div>
        </div>
      )}
    </div>
  );
}