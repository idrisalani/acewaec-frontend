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
  AlertCircle
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

export default function PracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  // const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasAutoSubmitted = useRef(false);

  const loadSession = useCallback(async () => {
    try {
      const cached = localStorage.getItem('currentPracticeSession');
      if (cached) {
        const data = JSON.parse(cached);
        setQuestions(data.questions);
        // setTotalTime(data.session.duration * 60);
        setTimeRemaining(data.session.duration * 60);

        const initialAnswers = data.questions.map((q: Question) => ({
          questionId: q.id,
          selectedAnswer: null,
          timeSpent: 0,
          flagged: false
        }));
        setAnswers(initialAnswers);
        localStorage.removeItem('currentPracticeSession');
      } else {
        const data = await practiceService.getSession(sessionId!);
        setQuestions(data.questions);
        // setTotalTime(data.session.duration * 60);
        setTimeRemaining(data.session.duration * 60);

        const initialAnswers = data.questions.map((q: Question) => ({
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

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;
    if (isAutoSubmit && hasAutoSubmitted.current) return;
    if (isAutoSubmit) hasAutoSubmitted.current = true;

    // Count answered questions
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
      // Submit each answer individually - FIX: iterate through answers array properly
      const submitPromises = answers
        .filter(answer => answer.selectedAnswer) // Only submit answered questions
        .map(answer =>
          practiceService.submitAnswer(
            sessionId!,
            answer.questionId,
            answer.selectedAnswer!
          ).catch(err => {
            console.error(`Failed to submit answer for question ${answer.questionId}:`, err);
            return null;
          })
        );

      await Promise.all(submitPromises);
      await practiceService.completeSession(sessionId!);

      // Get results
      const resultsResponse = await apiClient.get(`/practice/sessions/${sessionId}/results`);

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

  // const handleAutoSubmit = useCallback(async () => {
  //   await handleSubmit();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // We'll need to add handleSubmit to dependencies

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit(true); // Will auto-submit when timer hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, handleSubmit]);

  const handleSelectAnswer = (optionId: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      selectedAnswer: optionId
    };
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const toggleFlag = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].flagged = !updatedAnswers[currentQuestionIndex].flagged;
    setAnswers(updatedAnswers);
  };

  const getProgressPercentage = () => {
    const answered = answers.filter(a => a.selectedAnswer).length;
    return (answered / questions.length) * 100;
  };

  const getQuestionStatus = (index: number) => {
    const answer = answers[index];
    if (answer.flagged) return 'flagged';
    if (answer.selectedAnswer) return 'answered';
    return 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const answeredCount = answers.filter(a => a.selectedAnswer).length;
  const flaggedCount = answers.filter(a => a.flagged).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
            <AlertTriangle className="text-orange-500 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Exit Practice?</h3>
            <p className="text-gray-600 text-center mb-6">
              Your progress will be lost if you exit now. Are you sure you want to leave?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue Practice
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Exit Button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Exit</span>
            </button>

            {/* Progress Bar */}
            <div className="flex-1 mx-8">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-600">
                  {answeredCount} of {questions.length} answered
                </span>
                <span className="text-gray-600">
                  {Math.round(getProgressPercentage())}% complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' :
              timeRemaining < 600 ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
              <Clock size={20} />
              <span className="text-lg">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-red-800 text-sm flex-1">{submitError}</p>
          <button
            onClick={() => setSubmitError(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
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
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <button
                onClick={toggleFlag}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${currentAnswer.flagged
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <Flag size={20} fill={currentAnswer.flagged ? 'currentColor' : 'none'} />
                {currentAnswer.flagged ? 'Unflag' : 'Flag'}
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Questions</h3>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 mx-auto mb-1" size={20} />
                  <p className="text-xs text-gray-600">Answered</p>
                  <p className="text-lg font-bold text-green-600">{answeredCount}</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <Flag className="text-yellow-600 mx-auto mb-1" size={20} />
                  <p className="text-xs text-gray-600">Flagged</p>
                  <p className="text-lg font-bold text-yellow-600">{flaggedCount}</p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => handleJumpToQuestion(index)}
                      className={`
                        aspect-square rounded-lg font-bold text-sm transition-all
                        ${isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}
                        ${status === 'answered' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                        ${status === 'flagged' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                        ${status === 'unanswered' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Not answered</span>
                </div>
              </div>

              {/* Submit Button (Mobile) */}
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition-all shadow-md hover:shadow-lg lg:hidden"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}