import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * frontend/src/components/analytics/AnalyticsComponents.tsx
 * ✅ Complete components with TypeScript prop definitions
 * ✅ Fixed: toFixed() type error with Recharts formatter
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StudyGoal {
  id: string;
  name: string;
  targetScore: number;
  currentScore: number;
  deadline: Date;
  status: 'active' | 'completed' | 'failed';
}

export interface StreakData {
  current: number;
  longest: number;
}

export interface AccuracyData {
  userAccuracy: number;
  peerAverage: number;
}

export interface DashboardData {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  subject: string;
  date: Date;
}

// ============================================================================
// COMPONENT 1: StudyGoalsCard
// ============================================================================

export interface StudyGoalsCardProps {
  goals: StudyGoal[];
}

export const StudyGoalsCard: React.FC<StudyGoalsCardProps> = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Study Goals</h3>
        <p className="text-gray-500">No active goals yet. Set your first goal to get started!</p>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Study Goals</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {activeGoals.length} active
        </span>
      </div>

      {activeGoals.length > 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-xs text-gray-500 font-semibold uppercase">Active Goals</p>
          {activeGoals.map((goal) => (
            <div key={goal.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{goal.name}</p>
                  <p className="text-sm text-gray-600">
                    {goal.currentScore} / {goal.targetScore} points
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((goal.currentScore / goal.targetScore) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((goal.currentScore / goal.targetScore) * 100)}% complete
              </p>
            </div>
          ))}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase">Completed</p>
          {completedGoals.slice(0, 2).map((goal) => (
            <div key={goal.id} className="flex items-center text-sm text-green-600">
              <span className="mr-2">✓</span>
              {goal.name}
            </div>
          ))}
          {completedGoals.length > 2 && (
            <p className="text-xs text-gray-500">+{completedGoals.length - 2} more</p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT 2: StreakStats
// ============================================================================

export interface StreakStatsProps {
  current: number;
  longest: number;
}

export const StreakStats: React.FC<StreakStatsProps> = ({ current, longest }) => {
  const streakPercentage = longest > 0 ? (current / longest) * 100 : 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Streak Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">{current}</p>
              <p className="text-xs text-gray-500 mt-1">days in a row</p>
            </div>
            <span className="text-2xl">🔥</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Longest Streak</p>
              <p className="text-3xl font-bold text-green-600">{longest}</p>
              <p className="text-xs text-gray-500 mt-1">all time</p>
            </div>
            <span className="text-2xl">⭐</span>
          </div>
        </div>
      </div>

      {longest > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600 mb-2">Progress to Personal Best</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${streakPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {longest - current} days to beat your record
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT 3: AccuracyComparison
// ============================================================================

export interface AccuracyComparisonProps {
  userAccuracy: number;
  peerAverage: number;
}

export const AccuracyComparison: React.FC<AccuracyComparisonProps> = ({
  userAccuracy,
  peerAverage,
}) => {
  const data = [
    { name: 'You', accuracy: userAccuracy, fill: '#3b82f6' },
    { name: 'Peer Avg', accuracy: peerAverage, fill: '#9ca3af' },
  ];

  const difference = userAccuracy - peerAverage;
  const isAhead = difference > 0;

  // ✅ FIXED: Handle Recharts formatter type (ValueType can be various types)
  const formatAccuracy = (value: unknown): string => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    if (typeof value === 'string') {
      return `${value}%`;
    }
    return '%';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Accuracy Comparison</h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={formatAccuracy}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Bar dataKey="accuracy" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-800">
          You're{' '}
          <span
            className={`font-bold ${
              isAhead ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isAhead ? 'above' : 'below'}
          </span>{' '}
          average by{' '}
          <span
            className={`font-bold ${
              isAhead ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {Math.abs(difference).toFixed(1)}%
          </span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {isAhead
            ? '🎉 Great job! Keep it up!'
            : '💪 Focus on improvement areas to catch up'}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT 4: DashboardSection
// ============================================================================

export interface DashboardSectionProps {
  data: DashboardData;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ data }) => {
  const timeInMinutes = Math.round(data.timeSpent / 60);
  const averageTimePerQuestion = data.totalQuestions > 0
    ? Math.round(data.timeSpent / data.totalQuestions)
    : 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{data.subject}</h3>
        <p className="text-xs text-gray-500">
          {new Date(data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Questions</p>
          <p className="text-2xl font-bold text-blue-600">{data.totalQuestions}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Correct</p>
          <p className="text-2xl font-bold text-green-600">{data.correctAnswers}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Accuracy</p>
          <p className="text-2xl font-bold text-purple-600">{data.accuracy.toFixed(0)}%</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">Accuracy Progress</p>
          <p className="text-sm font-bold text-gray-900">{data.accuracy.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(data.accuracy, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Time Spent:</span>
          <span className="font-semibold text-gray-900">{timeInMinutes} min</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Avg Time/Question:</span>
          <span className="font-semibold text-gray-900">{averageTimePerQuestion}s</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Wrong Answers:</span>
          <span className="font-semibold text-gray-900">
            {data.totalQuestions - data.correctAnswers}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  StudyGoalsCard,
  StreakStats,
  AccuracyComparison,
  DashboardSection,
};