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
  Printer
} from 'lucide-react';
import { practiceService } from '../services/practice.service';
import ModernQuestionReview from '../components/ModernQuestionReview';

interface Question {
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

interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  isFlagged?: boolean;
  question: Question;
}

interface SessionResults {
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

export default function PracticeResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>([]);

  const loadResults = useCallback(async () => {
    try {
      const data = await practiceService.getSessionResults(sessionId!);
      console.log('Results data:', data); // ADD THIS
      console.log('Answers array:', data.answers); // ADD THIS
      setResults(data);

      // Calculate subject breakdown
      const subjectMap = new Map<string, { total: number; correct: number }>();

      data.answers.forEach((answer: Answer) => {
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
        percentage: Math.round((stats.correct / stats.total) * 100)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load results</p>
      </div>
    );
  }

  const { session, answers } = results;
  const percentage = session.score;
  const grade = percentage >= 75 ? 'A' : percentage >= 65 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F';
  const gradeColor = percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
  const gradeBg = percentage >= 75 ? 'bg-green-50' : percentage >= 50 ? 'bg-yellow-50' : 'bg-red-50';
  // const flaggedCount = answers.filter(a => a.isFlagged).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Print Button */}
        <div className="mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 ml-auto"
          >
            <Printer size={20} />
            Print Report
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${gradeBg} shadow-2xl`}>
            <span className={`text-6xl font-bold ${gradeColor}`}>{grade}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Practice Complete!</h1>
          <p className="text-xl text-gray-600">Here's how you performed</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 animate-fadeIn">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <Target className="mx-auto mb-3 text-indigo-600" size={32} />
              <p className="text-3xl font-bold text-gray-900">{percentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 mt-1">Score</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <CheckCircle className="mx-auto mb-3 text-green-600" size={32} />
              <p className="text-3xl font-bold text-gray-900">{session.correctAnswers}</p>
              <p className="text-sm text-gray-600 mt-1">Correct</p>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <XCircle className="mx-auto mb-3 text-red-600" size={32} />
              <p className="text-3xl font-bold text-gray-900">
                {session.totalQuestions - session.correctAnswers}
              </p>
              <p className="text-sm text-gray-600 mt-1">Incorrect</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Clock className="mx-auto mb-3 text-blue-600" size={32} />
              <p className="text-3xl font-bold text-gray-900">
                {Math.floor(session.timeSpent / 60)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Minutes</p>
            </div>
          </div>

          {/* Subject Performance Breakdown */}
          {subjectBreakdown.length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Subject</h3>
              <div className="space-y-4">
                {subjectBreakdown.map((subject) => (
                  <div key={subject.subject}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{subject.subject}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {subject.correct}/{subject.total}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${subject.percentage >= 70 ? 'bg-green-100 text-green-700' :
                            subject.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {subject.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${subject.percentage >= 70 ? 'bg-green-500' :
                            subject.percentage >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
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
          <div className={`p-6 rounded-xl ${gradeBg} border-2 ${percentage >= 75 ? 'border-green-200' : percentage >= 50 ? 'border-yellow-200' : 'border-red-200'
            }`}>
            <p className={`text-lg font-bold mb-2 ${gradeColor}`}>
              {percentage >= 75 ? '🎉 Excellent Work!' :
                percentage >= 50 ? '👍 Good Effort!' :
                  '💪 Keep Practicing!'}
            </p>
            <p className="text-gray-700 mb-3">
              {percentage >= 75 ?
                "Outstanding performance! You've mastered this topic. Keep up the great work!" :
                percentage >= 50 ?
                  "You're making good progress. Review the questions you missed to improve further." :
                  "Don't give up! Practice more and review the explanations to strengthen your understanding."
              }
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              {percentage >= 75 ? (
                <>
                  <li>• Try more challenging questions to push yourself further</li>
                  <li>• Maintain consistency with regular practice</li>
                </>
              ) : percentage >= 50 ? (
                <>
                  <li>• Review topics where you scored below 70%</li>
                  {subjectBreakdown.filter(s => s.percentage < 50).length > 0 && (
                    <li>• Focus on: {subjectBreakdown.filter(s => s.percentage < 50).map(s => s.subject).join(', ')}</li>
                  )}
                </>
              ) : (
                <>
                  <li>• Review WAEC syllabus thoroughly</li>
                  <li>• Consider seeking help from tutors</li>
                  {subjectBreakdown.filter(s => s.percentage < 50).length > 0 && (
                    <li>• Priority subjects: {subjectBreakdown.filter(s => s.percentage < 50).map(s => s.subject).join(', ')}</li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:hidden">
          <button
            onClick={() => setShowReview(!showReview)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <TrendingUp size={20} />
            {showReview ? 'Hide' : 'Review'} Answers
          </button>
          <button
            onClick={() => navigate('/practice/setup')}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <RotateCcw size={20} />
            Practice Again
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Award size={20} />
            View Analytics
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Home size={20} />
            Dashboard
          </button>
        </div>

        {/* Question Review */}
        {/* {showReview && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Review</h2>
            {answers.map((answer, idx) => {
              const correctOption = answer.question.options.find(opt => opt.isCorrect);
              const selectedOption = answer.question.options.find(opt => opt.id === answer.selectedAnswer);

              return (
                <div
                  key={answer.questionId}
                  className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${answer.isCorrect ? 'border-green-500' : 'border-red-500'
                    }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    {answer.isCorrect ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-bold text-gray-900">Q{idx + 1}.</span>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                          {answer.question.subject.name}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                          {answer.question.difficulty}
                        </span>
                        {answer.isFlagged && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                            <Flag size={12} fill="currentColor" />
                            Flagged
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 mb-3">{answer.question.content}</p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-gray-600">Your answer:</span>{' '}
                          <span className={answer.isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {selectedOption?.label}. {selectedOption?.content}
                          </span>
                        </p>
                        {!answer.isCorrect && correctOption && (
                          <p className="text-sm">
                            <span className="text-gray-600">Correct answer:</span>{' '}
                            <span className="text-green-700 font-semibold">
                              {correctOption.label}. {correctOption.content}
                            </span>
                          </p>
                        )}
                        {answer.question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <span className="font-semibold">Explanation:</span> {answer.question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )} */}
        <ModernQuestionReview answers={answers} showReview={showReview} />
      </div>
    </div>
  );
}