import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, BarChart3, Settings, UserCheck, AlertCircle, School, ArrowRight } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { adminService } from '../../services/admin.service';

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  totalQuestions: number;
  pendingQuestions: number;
  totalSchools: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Responsive */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-3 xs:py-4">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 xs:gap-3 min-w-0">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings className="text-white" size={16} />
              </div>
              <h1 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 truncate">
                Admin Dashboard
              </h1>
            </div>
            
            {/* User Info - Responsive */}
            <div className="flex items-center gap-2 xs:gap-3 justify-end">
              <span className="text-xs xs:text-sm text-gray-600 text-right">
                <span className="hidden xs:inline">Admin: </span>
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </span>
              {user?.avatar && (
                <img
                  src={`http://localhost:5000${user.avatar}`}
                  alt="Profile"
                  className="w-8 h-8 xs:w-10 xs:h-10 rounded-full object-cover border-2 border-red-200 flex-shrink-0"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-4 xs:py-6 md:py-8">
        {/* Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-6 mb-6 xs:mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="text-blue-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-xs xs:text-sm line-clamp-2">
                Total Users
              </h3>
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.totalUsers || 0}
            </p>
          </div>

          {/* Pending Users */}
          <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="text-yellow-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-xs xs:text-sm line-clamp-2">
                Pending
              </h3>
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.pendingUsers || 0}
            </p>
            {(stats?.pendingUsers || 0) > 0 && (
              <span className="inline-block mt-1 xs:mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Review
              </span>
            )}
          </div>

          {/* Total Questions */}
          <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-green-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-xs xs:text-sm line-clamp-2">
                Questions
              </h3>
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.totalQuestions || 0}
            </p>
          </div>

          {/* Pending Questions */}
          <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-orange-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-xs xs:text-sm line-clamp-2">
                Pending Q
              </h3>
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.pendingQuestions || 0}
            </p>
          </div>

          {/* Schools */}
          <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <School className="text-purple-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-xs xs:text-sm line-clamp-2">
                Schools
              </h3>
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.totalSchools || 0}
            </p>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="text-pink-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-xs xs:text-sm line-clamp-2">
                Subs
              </h3>
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.activeSubscriptions || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions with Pending Alerts - Mobile Responsive */}
        {((stats?.pendingUsers || 0) > 0 || (stats?.pendingQuestions || 0) > 0) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 mb-6 xs:mb-8">
            <div className="flex items-start gap-2 xs:gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5 xs:mt-1" size={20} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 mb-2 xs:mb-3 text-sm xs:text-base">
                  Pending Reviews
                </h3>
                <div className="space-y-1.5 xs:space-y-2">
                  {(stats?.pendingUsers || 0) > 0 && (
                    <button
                      onClick={() => navigate('/admin/users?status=PENDING')}
                      className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-gray-700 hover:text-indigo-600 transition-colors w-full p-1.5 xs:p-2 rounded hover:bg-white/50"
                    >
                      <span className="font-medium">{stats?.pendingUsers}</span>
                      <span className="hidden xs:inline">users waiting for approval</span>
                      <span className="xs:hidden">users pending</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                  {(stats?.pendingQuestions || 0) > 0 && (
                    <button
                      onClick={() => navigate('/admin/questions?status=pending')}
                      className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-gray-700 hover:text-indigo-600 transition-colors w-full p-1.5 xs:p-2 rounded hover:bg-white/50"
                    >
                      <span className="font-medium">{stats?.pendingQuestions}</span>
                      <span className="hidden xs:inline">questions need review</span>
                      <span className="xs:hidden">questions pending</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tools - Mobile Responsive */}
        <div className="bg-white rounded-lg xs:rounded-2xl border border-gray-200 shadow-sm p-3 xs:p-4 sm:p-6">
          <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-3 xs:mb-4">
            Admin Tools
          </h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
            {/* Manage Users */}
            <button
              onClick={() => navigate('/admin/users')}
              className="p-3 xs:p-4 sm:p-5 border-2 border-gray-200 rounded-lg xs:rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group active:scale-95 xs:active:scale-100"
            >
              <div className="flex items-center justify-between mb-2 xs:mb-3">
                <Users className="text-indigo-600 flex-shrink-0" size={22} />
                <ArrowRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={18} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm xs:text-base">
                Manage Users
              </h4>
              <p className="text-xs xs:text-sm text-gray-600 line-clamp-2">
                View and manage student accounts
              </p>
            </button>
            
            {/* Manage Questions */}
            <button
              onClick={() => navigate('/admin/questions')}
              className="p-3 xs:p-4 sm:p-5 border-2 border-gray-200 rounded-lg xs:rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group active:scale-95 xs:active:scale-100"
            >
              <div className="flex items-center justify-between mb-2 xs:mb-3">
                <BookOpen className="text-green-600 flex-shrink-0" size={22} />
                <ArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={18} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm xs:text-base">
                Manage Questions
              </h4>
              <p className="text-xs xs:text-sm text-gray-600 line-clamp-2">
                Add, edit, or remove questions
              </p>
            </button>
            
            {/* Manage Schools */}
            <button
              onClick={() => navigate('/admin/schools')}
              className="p-3 xs:p-4 sm:p-5 border-2 border-gray-200 rounded-lg xs:rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group active:scale-95 xs:active:scale-100"
            >
              <div className="flex items-center justify-between mb-2 xs:mb-3">
                <School className="text-purple-600 flex-shrink-0" size={22} />
                <ArrowRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" size={18} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm xs:text-base">
                Manage Schools
              </h4>
              <p className="text-xs xs:text-sm text-gray-600 line-clamp-2">
                Handle institutional accounts
              </p>
            </button>
            
            {/* View Analytics */}
            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-3 xs:p-4 sm:p-5 border-2 border-gray-200 rounded-lg xs:rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all text-left group active:scale-95 xs:active:scale-100"
            >
              <div className="flex items-center justify-between mb-2 xs:mb-3">
                <BarChart3 className="text-pink-600 flex-shrink-0" size={22} />
                <ArrowRight className="text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" size={18} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm xs:text-base">
                View Analytics
              </h4>
              <p className="text-xs xs:text-sm text-gray-600 line-clamp-2">
                See platform usage and statistics
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}