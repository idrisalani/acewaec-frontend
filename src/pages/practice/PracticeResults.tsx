import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  RotateCcw,
  Printer,
} from 'lucide-react';
import {
  practiceService,
  type SessionResults as ServiceSessionResults,
  type SessionAnswer as ServiceSessionAnswer,
  type Question as ServiceQuestion,
} from '../../services/practice.service';
import ModernQuestionReview from '../../components/ModernQuestionReview';

/**
 * Normalized question structure expected by ModernQuestionReview
 */
interface NormalizedQuestion {
  id: string;
  content: string;
  difficulty: string;
  explanation?: string;
  subject: { name: string };
  options: Array<{
    id: string;
    label: string;
    content: string;
    isCorrect: boolean;
  }>;
}

/**
 * Normalized answer structure for ModernQuestionReview
 */
interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  isFlagged: boolean;
  question: NormalizedQuestion;
}

/**
 * Local component state structure for results
 */
interface LocalSessionResults {
  session: {
    id: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
  };
  answers: Answer[];
}

interface SubjectBreakdown {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
}

/**
 * Normalize a service question to component-expected format
 */
function normalizeQuestion(serviceQuestion: ServiceQuestion): NormalizedQuestion {
  return {
    id: serviceQuestion.id,
    content: serviceQuestion.content,
    difficulty: serviceQuestion.difficulty,
    explanation: serviceQuestion.explanation,
    subject: {
      name: serviceQuestion.subject?.name || 'Unknown',
    },
    options: serviceQuestion.options.map((option, index) => ({
      id: option.id,
      label: option.label || String.fromCharCode(65 + index), // A, B, C, D...
      content: option.content,
      // Check if this option is the correct answer
      isCorrect: serviceQuestion.correctAnswer === option.id,
    })),
  };
}

/**
 * Normalize service answers to component format
 */
function normalizeAnswers(serviceAnswers: ServiceSessionAnswer[]): Answer[] {
  return serviceAnswers.map((answer) => ({
    questionId: answer.questionId,
    selectedAnswer: answer.selectedAnswer || '',
    isCorrect: answer.isCorrect,
    timeSpent: answer.timeSpent || 0,
    isFlagged: answer.isFlagged,
    question: normalizeQuestion(answer.question),
  }));
}

/**
 * Calculate session metrics from service data
 */
function calculateSessionMetrics(
  serviceResults: ServiceSessionResults
): LocalSessionResults {
  const normalizedAnswers = normalizeAnswers(serviceResults.answers);
  const correctAnswers = normalizedAnswers.filter((a) => a.isCorrect).length;

  // Calculate total time spent (sum of all answer times)
  const totalTimeSpent = normalizedAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0);

  // Calculate score as percentage
  const totalQuestions = normalizedAnswers.length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return {
    session: {
      id: serviceResults.session.id,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent: totalTimeSpent,
    },
    answers: normalizedAnswers,
  };
}

export default function PracticeResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<LocalSessionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>([]);

  const loadResults = useCallback(async () => {
    try {
      // Get results from service (returns ServiceSessionResults)
      const serviceResults = await practiceService.getSessionResults(sessionId!);

      // Transform to local format
      const localResults = calculateSessionMetrics(serviceResults);
      setResults(localResults);

      // Calculate subject breakdown
      const subjectMap = new Map<string, { total: number; correct: number }>();

      localResults.answers.forEach((answer) => {
        const subject = answer.question.subject.name;
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { total: 0, correct: 0 });
        }
        const stats = subjectMap.get(subject)!;
        stats.total++;
        if (answer.isCorrect) stats.correct++;
      });

      const breakdown = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
        subject,
        total: stats.total,
        correct: stats.correct,
        percentage: Math.round((stats.correct / stats.total) * 100),
      }));

      setSubjectBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-600">Failed to load results</p>
      </div>
    );
  }

  const { session, answers } = results;
  const percentage = session.score;
  const grade =
    percentage >= 75 ? 'A' : percentage >= 65 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F';
  const gradeColor = percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
  const gradeBg = percentage >= 75 ? 'bg-green-50' : percentage >= 50 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Practice Results</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              <Printer size={18} />
              <span className="hidden md:inline">Print</span>
            </button>
            <button
              onClick={() => window.print()}
              className="sm:hidden flex items-center gap-2 bg-gray-600 text-white px-2 py-2 rounded-lg hover:bg-gray-700"
            >
              <Printer size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
          <div
            className={`w-20 h-20 sm:w-32 sm:h-32 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-6 ${gradeBg} shadow-2xl`}
          >
            <span className={`text-4xl sm:text-6xl font-bold ${gradeColor}`}>{grade}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
          <p className="text-gray-600 text-sm sm:text-lg">Here's how you performed</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fadeIn">
          {/* Score Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <Target className="mx-auto mb-2 sm:mb-3 text-indigo-600" size={24} />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{percentage.toFixed(1)}%</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Score</p>
            </div>
            <div className="text-center p-3 sm:p-6 bg-green-50 rounded-xl">
              <CheckCircle className="mx-auto mb-2 sm:mb-3 text-green-600" size={24} />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{session.correctAnswers}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Correct</p>
            </div>
            <div className="text-center p-3 sm:p-6 bg-red-50 rounded-xl">
              <XCircle className="mx-auto mb-2 sm:mb-3 text-red-600" size={24} />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {session.totalQuestions - session.correctAnswers}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Incorrect</p>
            </div>
            <div className="text-center p-3 sm:p-6 bg-blue-50 rounded-xl">
              <Clock className="mx-auto mb-2 sm:mb-3 text-blue-600" size={24} />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{Math.floor(session.timeSpent / 60)}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Minutes</p>
            </div>
          </div>

          {/* Subject Performance Breakdown */}
          {subjectBreakdown.length > 0 && (
            <div className="mb-6 sm:mb-8 p-3 sm:p-6 bg-gray-50 rounded-xl">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Performance by Subject</h3>
              <div className="space-y-3 sm:space-y-4">
                {subjectBreakdown.map((subject) => (
                  <div key={subject.subject}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{subject.subject}</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {subject.correct}/{subject.total}
                        </span>
                        <span
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${
                            subject.percentage >= 70
                              ? 'bg-green-100 text-green-700'
                              : subject.percentage >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {subject.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          subject.percentage >= 70
                            ? 'bg-green-500'
                            : subject.percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Message */}
          <div
            className={`p-3 sm:p-6 rounded-xl ${gradeBg} border-2 ${
              percentage >= 75 ? 'border-green-200' : percentage >= 50 ? 'border-yellow-200' : 'border-red-200'
            }`}
          >
            <p className={`text-base sm:text-lg font-bold mb-2 ${gradeColor}`}>
              {percentage >= 75
                ? '🎉 Excellent Work!'
                : percentage >= 50
                ? '👍 Good Effort!'
                : '💪 Keep Practicing!'}
            </p>
            <p className="text-gray-700 mb-2 sm:mb-3 text-xs sm:text-sm">
              {percentage >= 75
                ? "Outstanding performance! You've mastered this topic. Keep up the great work!"
                : percentage >= 50
                ? 'You\'re making good progress. Review the questions you missed to improve further.'
                : "Don't give up! Practice more and review the explanations to strengthen your understanding."}
            </p>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
              {percentage >= 75 ? (
                <>
                  <li>• Try more challenging questions to push yourself further</li>
                  <li>• Maintain consistency with regular practice</li>
                </>
              ) : percentage >= 50 ? (
                <>
                  <li>• Review topics where you scored below 70%</li>
                  {subjectBreakdown.filter((s) => s.percentage < 50).length > 0 && (
                    <li>
                      • Focus on:{' '}
                      {subjectBreakdown
                        .filter((s) => s.percentage < 50)
                        .map((s) => s.subject)
                        .join(', ')}
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>• Review WAEC syllabus thoroughly</li>
                  <li>• Consider seeking help from tutors</li>
                  {subjectBreakdown.filter((s) => s.percentage < 50).length > 0 && (
                    <li>
                      • Priority subjects:{' '}
                      {subjectBreakdown
                        .filter((s) => s.percentage < 50)
                        .map((s) => s.subject)
                        .join(', ')}
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 print:hidden">
          <button
            onClick={() => setShowReview(!showReview)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm lg:text-base"
          >
            <TrendingUp size={18} />
            {showReview ? 'Hide' : 'Review'}
          </button>
          <button
            onClick={() => navigate('/practice/setup')}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm lg:text-base"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Again</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm lg:text-base"
          >
            <Award size={18} />
            <span className="hidden sm:inline">Analytics</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm lg:text-base"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>

        {/* Question Review */}
        <ModernQuestionReview answers={answers} showReview={showReview} />
      </div>
    </div>
  );
}