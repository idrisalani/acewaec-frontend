// frontend/src/components/analytics/LearningStreaks.tsx
import { useEffect, useState } from 'react';
import { Flame, Calendar, Trophy, AlertCircle, TrendingUp } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  streakProgress: number; // Days since last break
  nextMilestone: number;
  streakHistory: Array<{
    date: string;
    completed: boolean;
    sessionsCompleted: number;
  }>;
}

export default function LearningStreaks() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      // Simulated data - replace with actual API call
      setStreakData({
        currentStreak: 7,
        longestStreak: 15,
        totalDaysActive: 42,
        streakProgress: 7,
        nextMilestone: 10,
        streakHistory: generateStreakHistory(30)
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStreakHistory = (days: number) => {
    const history = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simulate streak with ~70% completion rate
      const completed = Math.random() > 0.3;

      history.push({
        date: date.toISOString().split('T')[0],
        completed,
        sessionsCompleted: completed ? Math.floor(Math.random() * 3) + 1 : 0
      });
    }

    return history;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Failed to load streak data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="text-orange-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Learning Streaks</h2>
      </div>

      {/* Main Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-orange-700">Current Streak</span>
            <Flame className="text-orange-600 animate-pulse" size={24} />
          </div>
          <p className="text-4xl font-bold text-orange-900 mb-1">{streakData.currentStreak}</p>
          <p className="text-sm text-orange-600 font-medium">Days in a row</p>

          {/* Progress to next milestone */}
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex justify-between text-xs text-orange-700 mb-1">
              <span>To {streakData.nextMilestone} day milestone:</span>
              <span>{streakData.nextMilestone - streakData.currentStreak} more days</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                style={{
                  width: `${Math.min((streakData.currentStreak / streakData.nextMilestone) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-700">Longest Streak</span>
            <Trophy className="text-purple-600" size={24} />
          </div>
          <p className="text-4xl font-bold text-purple-900 mb-1">{streakData.longestStreak}</p>
          <p className="text-sm text-purple-600 font-medium">Days achieved</p>

          {streakData.currentStreak === streakData.longestStreak && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full inline-block">
                🎉 You're on your best streak!
              </p>
            </div>
          )}
        </div>

        {/* Total Days Active */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-green-700">Total Days Active</span>
            <Calendar className="text-green-600" size={24} />
          </div>
          <p className="text-4xl font-bold text-green-900 mb-1">{streakData.totalDaysActive}</p>
          <p className="text-sm text-green-600 font-medium">Days with practice</p>

          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-xs text-green-600">
              {((streakData.totalDaysActive / 365) * 100).toFixed(0)}% consistency this year
            </p>
          </div>
        </div>
      </div>

      {/* Streak Motivation */}
      {streakData.currentStreak === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-yellow-900">Your streak ended</p>
            <p className="text-sm text-yellow-700 mt-1">
              Complete a practice session today to start a new streak!
            </p>
          </div>
        </div>
      )}

      {streakData.currentStreak > 0 && streakData.currentStreak < 7 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <TrendingUp className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-blue-900">Keep the momentum going!</p>
            <p className="text-sm text-blue-700 mt-1">
              {streakData.nextMilestone - streakData.currentStreak} more days to reach your next milestone 🎯
            </p>
          </div>
        </div>
      )}

      {streakData.currentStreak >= 7 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Trophy className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-green-900">Excellent streak!</p>
            <p className="text-sm text-green-700 mt-1">
              You're showing amazing consistency. Keep it up! 🔥
            </p>
          </div>
        </div>
      )}

      {/* Streak Calendar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Activity Heatmap (Last 30 Days)</h3>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}

          {streakData.streakHistory.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-110 ${
                day.completed
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-400'
              }`}
              title={`${new Date(day.date).toLocaleDateString()}: ${day.completed ? day.sessionsCompleted + ' sessions' : 'No practice'}`}
            >
              {day.completed ? (
                <span className="text-lg">✓</span>
              ) : (
                <span className="text-xs">—</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-emerald-500"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100"></div>
              <span>Inactive</span>
            </div>
          </div>
          <p className="text-gray-500">
            {streakData.streakHistory.filter(d => d.completed).length}/30 days active
          </p>
        </div>
      </div>

      {/* Streak Tips */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-900 mb-3">💡 Streak Tips</h3>
        <ul className="space-y-2 text-sm text-indigo-800">
          <li>✓ Practice even for 10 minutes to maintain your streak</li>
          <li>✓ Set a specific study time each day for consistency</li>
          <li>✓ Use reminders to never miss a day</li>
          <li>✓ Challenge friends to see who can build the longest streak</li>
        </ul>
      </div>
    </div>
  );
}