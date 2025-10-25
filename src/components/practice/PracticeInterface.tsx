import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Loader2, Flag, Home, ChevronLeft, ChevronRight, Pause, Play, CheckCircle, Menu, X } from 'lucide-react';
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
  const [showNavigator, setShowNavigator] = useState(false);
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
      localStorage.removeItem('currentSession');
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
    const sessionData = localStorage.getItem('currentSession');
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
  }, [navigate]);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
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
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Exit Practice?</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Your progress will be saved.</p>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={() => setShowExitModal(false)} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors">
                Continue
              </button>
              <button onClick={() => { setShowExitModal(false); handleSubmit(false); }} className="flex-1 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold transition-colors">
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base whitespace-nowrap ${isTimeCritical ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
              <Clock size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {isPaused ? (
                <button onClick={handleResume} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Play className="text-green-600" size={20} />
                </button>
              ) : (
                <button onClick={handlePause} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Pause className="text-yellow-600" size={20} />
                </button>
              )}
              <button onClick={() => setShowExitModal(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Home size={20} />
              </button>
              {/* Mobile navigator toggle */}
              <button onClick={() => setShowNavigator(!showNavigator)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
                {showNavigator ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {submitError && (
            <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              <p className="flex-1">{submitError}</p>
              <button onClick={() => setSubmitError(null)} className="text-red-600 hover:text-red-700">✕</button>
            </div>
          )}

          {/* Progress */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 font-medium">
              <span>{Object.keys(answers).length}/{questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Question Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-600">
                    Q{currentIndex + 1}/{questions.length}
                  </span>
                  <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${currentQuestion.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {currentQuestion.subject.name}
                  </span>
                </div>
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <Flag size={18} fill={flaggedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Question Content */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.content}
              </p>

              {currentQuestion.imageUrl && (
                <img src={currentQuestion.imageUrl} alt="Question" className="mb-6 rounded-lg border w-full object-cover max-h-64 sm:max-h-80" />
              )}

              {/* Options */}
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.label)}
                    disabled={isPaused}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all ${answers[currentQuestion.id] === option.label
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${answers[currentQuestion.id] === option.label
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {option.label}
                      </div>
                      <span className="flex-1 text-sm sm:text-base">{option.content}</span>
                      {answers[currentQuestion.id] === option.label && (
                        <CheckCircle className="text-indigo-600 flex-shrink-0" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <button
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  disabled={currentIndex === 0}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold disabled:opacity-50 transition-colors text-sm sm:text-base"
                >
                  <ChevronLeft size={18} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors text-sm sm:text-base"
                  >
                    <span>Submit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigator - Hidden on mobile, shown in modal */}
          <div className={`lg:col-span-1 ${showNavigator ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold mb-4 text-sm sm:text-base">Questions</h3>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 pb-4 border-b">
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="text-green-600 mx-auto mb-1" size={16} />
                  <p className="text-xs text-gray-600">Answered</p>
                  <p className="text-sm sm:text-lg font-bold text-green-600">{Object.keys(answers).length}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-xl">
                  <Flag className="text-yellow-600 mx-auto mb-1" size={16} />
                  <p className="text-xs text-gray-600">Flagged</p>
                  <p className="text-sm sm:text-lg font-bold text-yellow-600">{flaggedQuestions.size}</p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-5 gap-1 sm:gap-2 max-h-64 overflow-y-auto">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowNavigator(false);
                    }}
                    className={`aspect-square rounded-lg font-bold text-xs transition-all ${idx === currentIndex ? 'ring-2 ring-indigo-600 scale-110' : ''
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
            <p className="text-gray-900 font-bold text-lg">Submitting...</p>
            <p className="text-gray-600 text-sm">Please wait</p>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Paused</h2>
            <p className="text-gray-600 mb-6">Take a break. Your progress is saved.</p>
            <button
              onClick={handleResume}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Resume Practice
            </button>
          </div>
        </div>
      )}

      {/* Time Warning */}
      {isTimeCritical && timeLeft > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg animate-pulse text-sm sm:text-base max-w-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold">Less than 5 minutes!</span>
          </div>
        </div>
      )}
    </div>
  );
}