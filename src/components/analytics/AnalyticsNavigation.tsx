// frontend/src/components/analytics/AnalyticsNavigation.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Settings, LogOut, Bell, Download, Target, TrendingUp, Zap } from 'lucide-react';

interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export default function AnalyticsNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navTabs: NavTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 size={20} />,
      path: '/analytics'
    },
    {
      id: 'goals',
      label: 'Study Goals',
      icon: <Target size={20} />,
      path: '/analytics/goals'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <TrendingUp size={20} />,
      path: '/analytics/performance'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <Zap size={20} />,
      path: '/analytics/insights'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        {/* Left: Logo & Tabs */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-lg"
          >
            <BarChart3 size={24} />
            <span>Analytics</span>
          </button>

          <div className="flex gap-1">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isActive(tab.path)
                    ? 'bg-indigo-100 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Export Button */}
          <button
            onClick={() => navigate('/analytics/export')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Export reports"
          >
            <Download size={20} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <h3 className="font-semibold text-gray-900 mb-3">Study Reminders</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                    🔔 Don't break your 7-day streak! Practice today.
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                    📈 You're close to mastering Chemistry! 2 more topics.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings & Logout */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={() => {
              // Handle logout
              navigate('/login');
            }}
            className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-indigo-600 font-bold"
        >
          <BarChart3 size={20} />
          <span className="text-sm">Analytics</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/analytics/export')}
            className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                navigate(tab.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                isActive(tab.path)
                  ? 'bg-indigo-100 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
