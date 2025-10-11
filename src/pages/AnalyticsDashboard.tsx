import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analytics.service';
import {
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import PerformanceChart from '../components/analytics/PerformanceChart';
import DifficultyBreakdown from '../components/analytics/DifficultyBreakdown';
import TopicWeaknesses from '../components/analytics/TopicWeaknesses';

interface Recommendation {
  type: 'strength' | 'weakness' | 'practice' | 'mastery';
  priority: 'high' | 'medium' | 'low';
  message: string;
  subjectId: string;
  topicId?: string;
  action: string;
}

interface DashboardData {
  stats: {
    overview: {
      totalQuestions: number;
      totalCorrect: number;
      overallAccuracy: string;
      totalSessions: number;
      totalStudyTime: number;
      averageSessionScore: string;
      // ADD THESE LINES:
      easyCorrect: number;
      easyTotal: number;
      mediumCorrect: number;
      mediumTotal: number;
      hardCorrect: number;
      hardTotal: number;
    };
    subjectBreakdown: Array<{
      name: string;
      totalQuestions: number;
      correct: number;
      accuracy: number;
    }>;
    recentSessions: Array<{
      id: string;
      date: Date;
      score: number;
      questions: number;
      correct: number;
    }>;
  };
  recommendations: Recommendation[];
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await analyticsService.getDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics</p>
          <button onClick={loadDashboard} className="mt-4 text-indigo-600 hover:underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, recommendations } = data;

  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'weakness': return <AlertCircle className="text-red-600" size={20} />;
      case 'practice': return <BookOpen className="text-yellow-600" size={20} />;
      case 'strength': return <CheckCircle className="text-green-600" size={20} />;
      case 'mastery': return <Award className="text-purple-600" size={20} />;
    }
  };

  const getRecommendationBg = (type: Recommendation['type']) => {
    switch (type) {
      case 'weakness': return 'bg-red-50 border-red-200';
      case 'practice': return 'bg-yellow-50 border-yellow-200';
      case 'strength': return 'bg-green-50 border-green-200';
      case 'mastery': return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
          <p className="text-gray-600">Track your progress and get personalized recommendations</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Accuracy</span>
              <Target className="text-indigo-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.overallAccuracy}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.overview.totalCorrect} / {stats.overview.totalQuestions} correct
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Sessions</span>
              <BookOpen className="text-green-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.totalSessions}</p>
            <p className="text-xs text-gray-500 mt-1">Practice sessions completed</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Study Time</span>
              <Clock className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.totalStudyTime}</p>
            <p className="text-xs text-gray-500 mt-1">Minutes practiced</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Score</span>
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.averageSessionScore}%</p>
            <p className="text-xs text-gray-500 mt-1">Per session average</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Trend</h2>
          <PerformanceChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Difficulty Performance</h2>
            <DifficultyBreakdown data={{
              easyCorrect: stats.overview.easyCorrect || 0,
              easyTotal: stats.overview.easyTotal || 0,
              mediumCorrect: stats.overview.mediumCorrect || 0,
              mediumTotal: stats.overview.mediumTotal || 0,
              hardCorrect: stats.overview.hardCorrect || 0,
              hardTotal: stats.overview.hardTotal || 0
            }} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Topic Weaknesses</h2>
            <TopicWeaknesses />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-indigo-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Personalized Recommendations</h2>
              </div>

              {recommendations.length === 0 ? (
                <p className="text-gray-600">Complete more practice sessions to get personalized recommendations.</p>
              ) : (
                <div className="space-y-3">
                  {recommendations.slice(0, 8).map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${getRecommendationBg(rec.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">{rec.message}</p>
                          <p className="text-sm text-gray-700 mb-2">{rec.action}</p>
                          <button
                            onClick={() => {
                              // Navigate to practice with pre-selected subject/topic
                              navigate('/practice/setup', {
                                state: {
                                  preselectedSubject: rec.subjectId,
                                  preselectedTopic: rec.topicId
                                }
                              });
                            }}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                          >
                            Practice Now →
                          </button>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {rec.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
              <div className="space-y-2">
                {stats.recentSessions.length === 0 ? (
                  <p className="text-gray-600">No sessions yet. Start practicing!</p>
                ) : (
                  stats.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {session.correct}/{session.questions} questions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${session.score >= 75 ? 'text-green-600' :
                          session.score >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                          {session.score.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Subject Performance</h2>
              <div className="space-y-4">
                {stats.subjectBreakdown.length === 0 ? (
                  <p className="text-gray-600">No data yet</p>
                ) : (
                  stats.subjectBreakdown.map((subject, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                        <span className="text-sm font-bold text-gray-900">{subject.accuracy.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${subject.accuracy >= 75 ? 'bg-green-500' :
                            subject.accuracy >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          style={{ width: `${subject.accuracy}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {subject.correct}/{subject.totalQuestions} questions
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}