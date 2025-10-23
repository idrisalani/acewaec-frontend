import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  Target,
  Clock,
  BarChart3,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { getImageUrl } from '../config/apiConfig';

interface DashboardStats {
  overview?: {
    overallAccuracy?: number;
    totalSessions?: number;
    totalStudyTime?: number;
    averageSessionScore?: number;
  };
  recentSessions?: RecentSession[];
}

interface RecentSession {
  id: string;
  score: number;
  date: string | Date;
  correct: number;
  questions: number;
}

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (!user?.studentCategory) {
      alert('Please select your student category first');
      return;
    }
    navigate('/practice/setup');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'SCIENCE': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ART': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'COMMERCIAL': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const quickStats = [
    {
      icon: Target,
      label: 'Overall Accuracy',
      value: stats?.overview?.overallAccuracy || '0',
      unit: '%',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: BookOpen,
      label: 'Total Sessions',
      value: stats?.overview?.totalSessions || 0,
      unit: '',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Study Time',
      value: stats?.overview?.totalStudyTime || 0,
      unit: 'min',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Avg Score',
      value: stats?.overview?.averageSessionScore || '0',
      unit: '%',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-white" size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  AceWAEC Pro
                </h1>
                {user?.studentCategory && (
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${getCategoryColor(user.studentCategory)}`}>
                    {user.studentCategory}
                  </span>
                )}
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-3 lg:gap-6">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt="Profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-indigo-200"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-2 border-indigo-200 flex-shrink-0">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
                >
                  <Shield size={18} />
                  <span className="hidden lg:inline">Admin</span>
                </button>
              )}

              <button
                onClick={logout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm font-medium"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t space-y-2">
              <div className="px-3 py-2 text-sm">
                <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Shield size={18} />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {getGreeting()}, {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Welcome back. Let's continue your exam preparation journey
          </p>
        </div>

        {/* Quick Stats - Responsive Grid */}
        {!loading && stats?.overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {quickStats.map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.bgColor} rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all animate-fadeIn`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                    <stat.icon className="text-white" size={20} />
                  </div>
                  <TrendingUp className={stat.iconColor} size={18} />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-1">{stat.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold ${stat.iconColor}`}>
                  {stat.value}{stat.unit}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Start Practice */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Start Practice</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Begin a timed practice session with questions from your subjects
            </p>
            <button
              onClick={handleStartPractice}
              disabled={!user?.studentCategory}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 sm:py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              Start Session
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">My Progress</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              View detailed analytics and personalized recommendations
            </p>
            <Link
              to="/analytics"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              View Analytics
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
          </div>

          {/* Find Tutor */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Find Tutor</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Connect with qualified tutors for personalized support
            </p>
            <button
              onClick={() => navigate('/tutors')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              Browse Tutors
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </div>

        {/* Comprehensive Exam Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-2 mb-3 sm:mb-4 justify-center lg:justify-start">
                <Calendar size={24} />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">7-Day Comprehensive Exam</h3>
              </div>
              <p className="text-orange-100 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Experience a full WAEC simulation with 7 subjects over 7 days. Get your certificate upon completion!
              </p>
              <ul className="space-y-2 text-orange-100 text-sm sm:text-base">
                <li className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircleIcon size={18} />
                  <span>40 questions per subject</span>
                </li>
                <li className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircleIcon size={18} />
                  <span>3 hours per day</span>
                </li>
                <li className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircleIcon size={18} />
                  <span>Official certificate</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/comprehensive-exam/setup')}
              className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg hover:shadow-2xl transition-all flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Start 7-Day Exam
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {stats?.recentSessions && stats.recentSessions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Recent Activity</h3>
            <div className="space-y-2 sm:space-y-3">
              {stats.recentSessions.slice(0, 5).map((session: RecentSession, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${session.score >= 75 ? 'bg-green-100' :
                        session.score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                      <Target className={
                        session.score >= 75 ? 'text-green-600' :
                          session.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      } size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {session.correct}/{session.questions} correct
                      </p>
                    </div>
                  </div>
                  <p className={`text-xl sm:text-2xl font-bold text-right sm:text-left ${session.score >= 75 ? 'text-green-600' :
                      session.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                    {session.score.toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!stats?.recentSessions || stats.recentSessions.length === 0) && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Practice Sessions Yet</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Start your first practice session to see your progress here
            </p>
            <button
              onClick={handleStartPractice}
              disabled={!user?.studentCategory}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Start First Session
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckCircleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}