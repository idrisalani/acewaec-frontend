// frontend/src/components/analytics/StudyReminders.tsx
import { useEffect, useState } from 'react';
import { Bell, Clock, Settings, X, Check, RotateCw } from 'lucide-react';

interface Reminder {
  id: string;
  type: 'streak' | 'goal' | 'weak_topic' | 'new_content' | 'session';
  title: string;
  message: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  time?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

interface ReminderSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  streakReminders: boolean;
  goalReminders: boolean;
  weeklyReport: boolean;
  pushNotifications: boolean;
}

export default function StudyReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    dailyReminder: true,
    reminderTime: '08:00',
    streakReminders: true,
    goalReminders: true,
    weeklyReport: true,
    pushNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      // Simulated reminders data
      setReminders([
        {
          id: '1',
          type: 'streak',
          title: 'Keep Your Streak Going! 🔥',
          message: "You're on a 7-day streak! Practice now to keep it alive.",
          icon: '🔥',
          priority: 'high',
          time: 'Today at 8:00 AM',
          actionUrl: '/practice/setup',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'goal',
          title: 'Chemistry Goal Progress',
          message: 'You need 5 more correct answers to reach your 85% accuracy goal!',
          icon: '🎯',
          priority: 'medium',
          time: 'Today at 10:30 AM',
          actionUrl: '/practice/setup?subject=chemistry',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'weak_topic',
          title: 'Focus Area Identified',
          message: 'Organic Chemistry is a weak area. Consider practicing this topic.',
          icon: '⚠️',
          priority: 'medium',
          time: 'Yesterday',
          actionUrl: '/practice/setup?topic=organic-chemistry',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '4',
          type: 'new_content',
          title: 'New Questions Available',
          message: 'Fresh Biology questions have been added to the question bank!',
          icon: '📚',
          priority: 'low',
          time: 'Yesterday',
          actionUrl: '/practice/setup?subject=biology',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '5',
          type: 'session',
          title: 'Weekly Report Ready',
          message: 'Your weekly performance report is ready to review.',
          icon: '📊',
          priority: 'low',
          time: '2 days ago',
          actionUrl: '/analytics',
          read: true,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (reminderId: string) => {
    setReminders(reminders.map(r => 
      r.id === reminderId ? { ...r, read: true } : r
    ));
  };

  const handleDismiss = (reminderId: string) => {
    setReminders(reminders.filter(r => r.id !== reminderId));
  };

  const handleMarkAllAsRead = () => {
    setReminders(reminders.map(r => ({ ...r, read: true })));
  };

  const handleSaveSettings = async () => {
    try {
      // Save settings to backend
      console.log('Saving reminder settings:', settings);
      setShowSettings(false);
      // Show success toast
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'unread') return !r.read;
    if (filter === 'high') return r.priority === 'high';
    return true;
  });

  const unreadCount = reminders.filter(r => !r.read).length;

  const getPriorityColor = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Study Reminders</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Reminder Settings</h3>

          <div className="space-y-3">
            {/* Enable/Disable */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable all reminders</span>
            </label>

            {settings.enabled && (
              <>
                {/* Daily Reminder */}
                <div className="pl-7 space-y-3 border-l border-gray-200 py-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dailyReminder}
                      onChange={(e) => setSettings({ ...settings, dailyReminder: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Daily reminder</span>
                  </label>

                  {settings.dailyReminder && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-xs text-gray-500">every day</span>
                    </div>
                  )}
                </div>

                {/* Other Settings */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.streakReminders}
                    onChange={(e) => setSettings({ ...settings, streakReminders: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Streak reminders 🔥</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.goalReminders}
                    onChange={(e) => setSettings({ ...settings, goalReminders: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Goal progress alerts 🎯</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.weeklyReport}
                    onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Weekly report 📊</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Push notifications</span>
                </label>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Settings
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-indigo-100 text-indigo-600 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-indigo-100 text-indigo-600 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'high'
              ? 'bg-indigo-100 text-indigo-600 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          High Priority
        </button>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="ml-auto px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Bell className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-gray-600">No reminders</p>
          </div>
        ) : (
          filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border-2 ${getPriorityColor(reminder.priority)} transition-all ${
                !reminder.read ? 'ring-2 ring-indigo-400' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{reminder.icon}</span>
                    <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(reminder.priority)}`}>
                      {reminder.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{reminder.message}</p>
                  <p className="text-xs text-gray-500">{reminder.time}</p>

                  {reminder.actionUrl && (
                    <button
                      onClick={() => window.location.href = reminder.actionUrl!}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      Take Action →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!reminder.read && (
                    <button
                      onClick={() => handleMarkAsRead(reminder.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dismiss"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State Tips */}
      {reminders.length === 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-700">
          <p className="font-medium mb-1">💡 Pro Tip</p>
          <p>Complete practice sessions to unlock personalized study reminders based on your performance and goals.</p>
        </div>
      )}
    </div>
  );
}