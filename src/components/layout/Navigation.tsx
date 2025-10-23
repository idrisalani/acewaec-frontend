// frontend/src/components/layout/Navigation.MOBILE.tsx
// ✅ MOBILE OPTIMIZED - Responsive navigation with improved touch targets

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  BarChart3,
  BookOpen,
  Settings,
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
    setIsProfileOpen(false);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 shadow-md ${
        variant === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Main Navigation Bar */}
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo/Brand - Mobile optimized */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-xl flex-shrink-0"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              <Zap size={18} />
            </div>
            {/* Full text hidden on mobile, single letter on small screens */}
            <span className="hidden sm:inline">AceWAEC Pro</span>
            <span className="sm:hidden font-bold">Ace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm ${
                    isActive(item.path)
                      ? 'bg-indigo-100 text-indigo-600'
                      : variant === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Actions (Mobile friendly) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Premium Badge - Hidden on very small screens */}
            <button
              onClick={() => navigate('/pricing')}
              className="hidden sm:inline-flex px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-full text-xs sm:text-sm font-semibold hover:shadow-lg transition-shadow flex-shrink-0"
            >
              ✨<span className="hidden md:inline ml-1">Premium</span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                  variant === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <User size={20} />
              </button>

              {/* Profile Dropdown - Mobile positioned */}
              {isProfileOpen && (
                <>
                  {/* Mobile overlay */}
                  <div 
                    className="fixed inset-0 md:hidden z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  
                  {/* Dropdown menu */}
                  <div
                    className={`absolute right-0 mt-2 w-40 sm:w-48 rounded-lg shadow-lg py-2 z-50 ${
                      variant === 'dark'
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
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
                      onClick={() => setIsProfileOpen(false)}
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
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Responsive layout */}
        {isOpen && (
          <div className="md:hidden pb-3 space-y-1 border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-indigo-100 text-indigo-600'
                      : variant === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile divider */}
            <div className="my-2 border-t border-gray-200" />

            {/* Mobile premium upgrade button */}
            <button
              onClick={() => {
                navigate('/pricing');
                setIsOpen(false);
              }}
              className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow"
            >
              ✨ Upgrade to Premium
            </button>

            {/* Mobile profile links */}
            <div className="space-y-1 mt-2">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium ${
                  variant === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                } rounded-lg`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium ${
                  variant === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                } rounded-lg`}
              >
                Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}