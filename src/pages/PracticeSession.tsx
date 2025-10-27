import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  AlertTriangle,
  Home,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { practiceService } from '../services/practice.service';
import QuestionCard from '../components/practice/QuestionCard';
import apiClient from '../services/api';

interface Question {
  id: string;
  content: string;
  difficulty: string;
  options: Array<{
    id: string;
    label: string;
    content: string;
  }>;
}

interface Answer {
  questionId: string;
  selectedAnswer: string | null;
  timeSpent: number;
  flagged: boolean;
}

interface CachedSession {
  session: {
    id: string;
    name: string;
    type: string;
    status: string;
    score?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    createdAt: string;
    completedAt?: string;
    duration?: number;
  };
  questions: Question[];
  totalAvailable?: number;
}

interface SessionResponse {
  session: {
    id: string;
    name: string;
    type: string;
    status: string;
    score?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    createdAt: string;
    completedAt?: string;
    duration?: number;
  };
  questions: Question[];
  totalAvailable?: number;
}

interface ResultsResponse {
  data: {
    data: unknown;
  };
}

export default function PracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);
  const hasAutoSubmitted = useRef(false);

  const loadSession = useCallback(async (): Promise<void> => {
    try {
      const cached = localStorage.getItem('currentPracticeSession');
      if (cached) {
        const data: CachedSession = JSON.parse(cached);
        setQuestions(data.questions);
        setTimeRemaining((data.session.duration ?? 60) * 60);

        const initialAnswers: Answer[] = data.questions.map((q: Question) => ({
          questionId: q.id,
          selectedAnswer: null,
          timeSpent: 0,
          flagged: false
        }));
        setAnswers(initialAnswers);
        localStorage.removeItem('currentPracticeSession');
      } else {
        const data: SessionResponse = await practiceService.getSession(sessionId!);
        setQuestions(data.questions);
        setTimeRemaining((data.session.duration ?? 60) * 60);

        const initialAnswers: Answer[] = data.questions.map((q: Question) => ({
          questionId: q.id,
          selectedAnswer: null,
          timeSpent: 0,
          flagged: false
        }));
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Session not found or expired');
      navigate('/practice/setup');
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  const handleSubmit = useCallback(async (isAutoSubmit = false): Promise<void> => {
    if (submitting) return;
    if (isAutoSubmit && hasAutoSubmitted.current) return;
    if (isAutoSubmit) hasAutoSubmitted.current = true;

    const answeredCount = answers.filter(a => a.selectedAnswer).length;

    if (answeredCount === 0 && !isAutoSubmit) {
      if (!confirm('You haven\'t answered any questions. Submit anyway?')) {
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const submitPromises = answers
        .filter(answer => answer.selectedAnswer)
        .map(answer =>
          practiceService.submitAnswer(
            sessionId!,
            answer.questionId,
            answer.selectedAnswer!
          ).catch((err: Error) => {
            console.error(`Failed to submit answer for question ${answer.questionId}:`, err);
            return null;
          })
        );

      await Promise.all(submitPromises);
      await practiceService.completeSession(sessionId!);

      const resultsResponse: ResultsResponse = await apiClient.get(`/practice/sessions/${sessionId}/results`);

      localStorage.removeItem('currentPracticeSession');
      navigate(`/practice/${sessionId}/results`, {
        state: resultsResponse.data.data,
        replace: true
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit answers. Please try again.');
      setSubmitting(false);
      if (isAutoSubmit) hasAutoSubmitted.current = false;
    }
  }, [answers, navigate, sessionId, submitting]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, handleSubmit]);

  const handleSelectAnswer = (optionId: string): void => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      selectedAnswer: optionId
    };
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = (): void => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowNavigator(false);
    }
  };

  const handlePreviousQuestion = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowNavigator(false);
    }
  };

  const handleJumpToQuestion = (index: number): void => {
    setCurrentQuestionIndex(index);
    setShowNavigator(false);
  };

  const toggleFlag = (): void => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].flagged = !updatedAnswers[currentQuestionIndex].flagged;
    setAnswers(updatedAnswers);
  };

  const getProgressPercentage = (): number => {
    const answered = answers.filter(a => a.selectedAnswer).length;
    return (answered / questions.length) * 100;
  };

  const getQuestionStatus = (index: number): string => {
    const answer = answers[index];
    if (answer.flagged) return 'flagged';
    if (answer.selectedAnswer) return 'answered';
    return 'unanswered';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Found</h2>
          <p className="text-gray-600 mb-6">This practice session appears to be empty.</p>
          <button
            onClick={() => navigate('/practice/setup')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Create New Session
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const answeredCount = answers.filter(a => a.selectedAnswer).length;
  const flaggedCount = answers.filter(a => a.flagged).length;

  // Show exit confirmation
  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={28} className="text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Exit Session?</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to exit? Your progress will be lost.
          </p>
          <div className="flex gap-4 flex-col-reverse sm:flex-row">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              Continue Session
            </button>
            <button
              onClick={() => navigate('/practice/setup')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Exit Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Exit Button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base flex-shrink-0"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Exit</span>
            </button>

            {/* Progress Bar - Hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex-1 sm:flex sm:flex-col">
              <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
                <span className="text-gray-600">
                  {answeredCount}/{questions.length} answered
                </span>
                <span className="text-gray-600">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex-shrink-0 ${timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' :
              timeRemaining < 600 ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
              <Clock size={16} />
              <span>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Mobile Navigator Toggle */}
            <button
              onClick={() => setShowNavigator(!showNavigator)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showNavigator ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Progress */}
          <div className="sm:hidden mt-2 flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>{answeredCount}/{questions.length} answered</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="sm:hidden w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all rounded-full"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="m-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 max-w-7xl mx-auto">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-red-800 text-xs sm:text-sm flex-1">{submitError}</p>
          <button
            onClick={() => setSubmitError(null)}
            className="text-red-600 hover:text-red-800 font-bold flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={currentAnswer.selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              timeRemaining={timeRemaining}
            />

            {/* Navigation */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                onClick={toggleFlag}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${currentAnswer.flagged
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <Flag size={18} fill={currentAnswer.flagged ? 'currentColor' : 'none'} />
                {currentAnswer.flagged ? 'Unflag' : 'Flag'}
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className={`lg:col-span-1 ${showNavigator ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Questions</h3>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 pb-4 border-b">
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 mx-auto mb-1" size={18} />
                  <p className="text-xs text-gray-600">Answered</p>
                  <p className="text-base sm:text-lg font-bold text-green-600">{answeredCount}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                  <Flag className="text-yellow-600 mx-auto mb-1" size={18} />
                  <p className="text-xs text-gray-600">Flagged</p>
                  <p className="text-base sm:text-lg font-bold text-yellow-600">{flaggedCount}</p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2 max-h-72 overflow-y-auto mb-4">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => handleJumpToQuestion(index)}
                      className={`aspect-square rounded-lg font-bold text-xs sm:text-sm transition-all ${isCurrent ? 'ring-2 ring-indigo-600 scale-110' : ''} ${status === 'answered' ? 'bg-green-100 text-green-700' : ''} ${status === 'flagged' ? 'bg-yellow-100 text-yellow-700' : ''} ${status === 'unanswered' ? 'bg-gray-100 text-gray-600' : ''}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 sm:pt-4 border-t space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded" />
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded" />
                  <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 rounded" />
                  <span className="text-gray-600">Not answered</span>
                </div>
              </div>

              {/* Submit Button (Mobile) */}
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 sm:py-3 rounded-lg font-semibold disabled:opacity-50 transition-all shadow-md hover:shadow-lg lg:hidden text-sm sm:text-base"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}