// frontend/src/components/analytics/PeerComparison.tsx
import { useEffect, useState } from 'react';
import { Users, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsService } from '../../services/analytics.service';

interface PeerStats {
  yourAccuracy: number;
  averageAccuracy: number;
  yourRank: number;
  totalStudents: number;
  percentile: number;
  accuracyTrend: Array<{ date: string; yourScore: number; classAverage: number }>;
  subjectComparison: Array<{
    subject: string;
    yourAccuracy: number;
    classAverage: number;
  }>;
  topPerformers: Array<{
    name: string;
    accuracy: number;
    sessions: number;
  }>;
}

export default function PeerComparison() {
  const [stats, setStats] = useState<PeerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'trend' | 'subject'>('overview');

  useEffect(() => {
    loadPeerComparison();
  }, []);

  const loadPeerComparison = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getPeerComparison();
      setStats(data);
    } catch (error) {
      console.error('Failed to load peer comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Failed to load peer comparison data</p>
      </div>
    );
  }

  const percentileRank = Math.round((stats.percentile / stats.totalStudents) * 100);
  const accuracyDiff = stats.yourAccuracy - stats.averageAccuracy;

  const performanceData = [
    { name: 'You', value: stats.yourAccuracy, fill: '#4f46e5' },
    { name: 'Class Average', value: stats.averageAccuracy, fill: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="text-indigo-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Peer Comparison</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Your Accuracy */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700">Your Accuracy</span>
            <TrendingUp className="text-indigo-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-indigo-900">{stats.yourAccuracy.toFixed(1)}%</p>
          <p className={`text-xs mt-2 font-medium ${accuracyDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {accuracyDiff >= 0 ? '↑' : '↓'} {Math.abs(accuracyDiff).toFixed(1)}% vs class
          </p>
        </div>

        {/* Class Average */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Class Average</span>
            <BarChart3 className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-900">{stats.averageAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-green-600 mt-2 font-medium">Based on {stats.totalStudents} students</p>
        </div>

        {/* Your Rank */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Your Rank</span>
            <Award className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-purple-900">#{stats.yourRank}</p>
          <p className="text-xs text-purple-600 mt-2 font-medium">Out of {stats.totalStudents} students</p>
        </div>

        {/* Percentile */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Percentile</span>
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-orange-900">Top {Math.max(1, 100 - percentileRank)}%</p>
          <p className="text-xs text-orange-600 mt-2 font-medium">Better than {percentileRank}% of class</p>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 rounded transition-colors ${
            view === 'overview'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('trend')}
          className={`px-4 py-2 rounded transition-colors ${
            view === 'trend'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Trend
        </button>
        <button
          onClick={() => setView('subject')}
          className={`px-4 py-2 rounded transition-colors ${
            view === 'subject'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          By Subject
        </button>
      </div>

      {/* Overview */}
      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accuracy Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Accuracy Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
            <div className="space-y-3">
              {stats.topPerformers.map((performer, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                      <p className="text-xs text-gray-500">{performer.sessions} sessions</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{performer.accuracy.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trend */}
      {view === 'trend' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Accuracy Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stats.accuracyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}%`}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="yourScore"
                name="Your Score"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="classAverage"
                name="Class Average"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By Subject */}
      {view === 'subject' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Accuracy by Subject</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.subjectComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="yourAccuracy" fill="#4f46e5" name="Your Accuracy" />
              <Bar dataKey="classAverage" fill="#10b981" name="Class Average" />
            </BarChart>
          </ResponsiveContainer>

          {/* Performance Notes */}
          <div className="mt-6 space-y-2">
            {stats.subjectComparison.map((subject, idx) => {
              const diff = subject.yourAccuracy - subject.classAverage;
              return (
                <div key={idx} className="flex items-center justify-between p-2 text-sm">
                  <span className="text-gray-700">{subject.subject}</span>
                  <span className={diff >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% vs class
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}