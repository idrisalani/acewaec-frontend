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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Admin: {user?.firstName} {user?.lastName}
            </span>
            {user?.avatar && (
              <img
                src={`http://localhost:5000${user.avatar}`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-red-200"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-yellow-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Pending</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.pendingUsers || 0}</p>
            {(stats?.pendingUsers || 0) > 0 && (
              <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Needs Review
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-green-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Questions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalQuestions || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Pending Q</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.pendingQuestions || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <School className="text-purple-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Schools</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalSchools || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-pink-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Active Subs</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</p>
          </div>
        </div>

        {/* Quick Actions with Pending Alerts */}
        {((stats?.pendingUsers || 0) > 0 || (stats?.pendingQuestions || 0) > 0) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Pending Reviews</h3>
                <div className="space-y-2">
                  {(stats?.pendingUsers || 0) > 0 && (
                    <button
                      onClick={() => navigate('/admin/users?status=PENDING')}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      <span className="font-medium">{stats?.pendingUsers} users</span>
                      <span>waiting for approval</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                  {(stats?.pendingQuestions || 0) > 0 && (
                    <button
                      onClick={() => navigate('/admin/questions?status=pending')}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      <span className="font-medium">{stats?.pendingQuestions} questions</span>
                      <span>need review</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tools */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Tools</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="text-indigo-600" size={24} />
                <ArrowRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Manage Users</h4>
              <p className="text-sm text-gray-600">View and manage student accounts</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/questions')}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="text-green-600" size={24} />
                <ArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Manage Questions</h4>
              <p className="text-sm text-gray-600">Add, edit, or remove practice questions</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/schools')}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <School className="text-purple-600" size={24} />
                <ArrowRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Manage Schools</h4>
              <p className="text-sm text-gray-600">Handle institutional accounts</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="text-pink-600" size={24} />
                <ArrowRight className="text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">View Analytics</h4>
              <p className="text-sm text-gray-600">See platform usage and statistics</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}