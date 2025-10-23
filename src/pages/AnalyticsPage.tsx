import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award, Clock, Target, ArrowLeft, Download } from 'lucide-react';
import apiClient from '../services/api';

interface SubjectPerformance {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
}

interface AnalyticsData {
  totalSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  timeSpent: number;
  subjectPerformance: SubjectPerformance[];
  recentSessions: Array<{
    id: string;
    date: string;
    score: number;
    totalQuestions: number;
  }>;
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/analytics/student');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analytics data available</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Mobile optimized */}
      <nav className="bg-white shadow-sm border-b print:hidden sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="flex-shrink-0" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Title - Hidden on mobile, shown on sm and up */}
            <h1 className="hidden sm:block text-lg sm:text-2xl font-bold text-gray-900 flex-1 text-center">
              My Performance
            </h1>
            <h1 className="sm:hidden text-base font-bold text-gray-900">
              Performance
            </h1>

            {/* Print Button */}
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Download size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Summary Cards - Mobile optimized grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {/* Total Sessions */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Sessions
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {analytics.totalSessions}
                </p>
              </div>
              <Target className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Avg Score
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {analytics.averageScore}%
                </p>
              </div>
              <TrendingUp className="text-green-500 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            </div>
          </div>

          {/* Questions Answered */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Questions
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {analytics.totalQuestions}
                </p>
              </div>
              <Award className="text-purple-500 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            </div>
          </div>

          {/* Time Spent */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Time
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {Math.floor(analytics.timeSpent / 60)}h
                </p>
              </div>
              <Clock className="text-orange-500 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Subject Performance - Mobile optimized */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            Subject Performance
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {analytics.subjectPerformance.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    {subject.subject}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 font-semibold">
                    {subject.correct}/{subject.total} ({subject.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      subject.percentage >= 70
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : subject.percentage >= 50
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions - Mobile optimized table */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            Recent Practice Sessions
          </h2>

          {/* Mobile: Card view, Desktop: Table view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Questions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.recentSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {session.totalQuestions}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          session.score >= 70
                            ? 'bg-green-100 text-green-800'
                            : session.score >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {session.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card view */}
          <div className="sm:hidden space-y-3">
            {analytics.recentSessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {session.totalQuestions} questions
                    </p>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      session.score >= 70
                        ? 'text-green-600'
                        : session.score >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {session.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      session.score >= 70
                        ? 'bg-green-500'
                        : session.score >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${session.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {analytics.recentSessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No sessions yet. Start practicing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}