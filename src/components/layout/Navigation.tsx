// frontend/src/components/layout/Navigation.tsx
// ✅ REUSABLE - Consistent navigation across all pages

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  User,
  Zap,
} from 'lucide-react';

interface NavigationProps {
  variant?: 'light' | 'dark';
}

export default function Navigation({ variant = 'light' }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Practice', path: '/practice', icon: BookOpen },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav
      className={`sticky top-0 z-50 shadow-md ${
        variant === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={20} />
            </div>
            <span className="hidden sm:inline">AceWAEC Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-100 text-indigo-600'
                      : variant === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* Premium Badge */}
            <button
              onClick={() => navigate('/pricing')}
              className="hidden sm:px-3 sm:py-1 sm:bg-gradient-to-r sm:from-yellow-400 sm:to-yellow-500 sm:text-gray-900 sm:rounded-full sm:text-xs sm:font-semibold sm:hover:shadow-lg sm:transition-shadow"
            >
              ✨ Premium
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  variant === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <User size={20} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 ${
                    variant === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <Link
                    to="/profile"
                    className={`block px-4 py-2 text-sm ${
                      variant === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/settings"
                    className={`block px-4 py-2 text-sm ${
                      variant === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      variant === 'dark'
                        ? 'text-red-400 hover:bg-gray-700'
                        : 'text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-100 text-indigo-600'
                      : variant === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                navigate('/pricing');
                setIsOpen(false);
              }}
              className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow"
            >
              ✨ Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}