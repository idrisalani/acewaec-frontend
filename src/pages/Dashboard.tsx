import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  Award,
  Zap,
  Target,
  Clock,
  BarChart3,
  ChevronRight,
  User
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';

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

  // Get category badge color
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AceWAEC Pro
              </h1>
              {/* Student Category Badge */}
              {user?.studentCategory && (
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${getCategoryColor(user.studentCategory)}`}>
                  {user.studentCategory}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Profile Info - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {/* User Avatar */}
              {user?.avatar ? (
                <img
                  src={`http://localhost:5000${user.avatar}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-2 border-indigo-200">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Admin Panel Button */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
              >
                <Shield size={18} />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Warning */}
        {!user?.studentCategory && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-md animate-slideIn">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-yellow-900 text-lg">Complete Your Profile</h3>
                <p className="text-yellow-800 mt-1">
                  Select your student category (Science, Art, or Commercial) to unlock all features and get personalized recommendations.
                </p>
                <button
                  onClick={() => navigate('/settings')}
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex items-center gap-6">
            {/* Large Avatar */}
            {user?.avatar ? (
              <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl hidden sm:block">
                <img
                  src={`http://localhost:5000${user.avatar}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 shadow-xl hidden sm:flex items-center justify-center">
                <User className="text-white" size={40} />
              </div>
            )}

            <div className="flex-1">
              <p className="text-indigo-200 font-medium mb-2">{getGreeting()},</p>
              <h2 className="text-4xl font-bold mb-4">
                {user?.firstName} {user?.lastName}!
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-indigo-100">
                <div className="flex items-center gap-2">
                  <Award size={20} />
                  <span>{user?.studentCategory || 'Category not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={20} />
                  <span>{user?.subscriptionTier} Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeIn`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <TrendingUp className={stat.iconColor} size={20} />
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.iconColor}`}>
                  {stat.value}{stat.unit}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Start Practice */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <BookOpen className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Practice</h3>
            <p className="text-gray-600 mb-6">
              Begin a timed practice session with questions from your subjects
            </p>
            <button
              onClick={handleStartPractice}
              disabled={!user?.studentCategory}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              Start Session
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">My Progress</h3>
            <p className="text-gray-600 mb-6">
              View detailed analytics and personalized recommendations
            </p>
            <Link
              to="/analytics"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              View Analytics
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>

          {/* Find Tutor */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Users className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Find Tutor</h3>
            <p className="text-gray-600 mb-6">
              Connect with qualified tutors for personalized support
            </p>
            <button
              onClick={() => navigate('/tutors')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              Browse Tutors
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>
        </div>

        {/* Comprehensive Exam Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={32} />
                <h3 className="text-3xl font-bold">7-Day Comprehensive Exam</h3>
              </div>
              <p className="text-orange-100 text-lg mb-4">
                Experience a full WAEC simulation with 7 subjects over 7 days. Get your certificate upon completion!
              </p>
              <ul className="space-y-2 text-orange-100">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>40 questions per subject</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>3 hours per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>Official certificate</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/comprehensive-exam/setup')}
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-2 group"
            >
              Start 7-Day Exam
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {stats?.recentSessions && stats.recentSessions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {stats.recentSessions.slice(0, 5).map((session: RecentSession, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.score >= 75 ? 'bg-green-100' :
                        session.score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                      <Target className={
                        session.score >= 75 ? 'text-green-600' :
                          session.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      } size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.correct}/{session.questions} questions correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${session.score >= 75 ? 'text-green-600' :
                        session.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                      {session.score.toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Recent Activity */}
        {(!stats?.recentSessions || stats.recentSessions.length === 0) && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Practice Sessions Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first practice session to see your progress here
            </p>
            <button
              onClick={handleStartPractice}
              disabled={!user?.studentCategory}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start First Session
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}