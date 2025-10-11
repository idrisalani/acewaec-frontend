import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Check, 
  X, 
  Ban, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  School,
  Eye,
  Download,
  ShieldCheck,
  Clock,
  Activity
} from 'lucide-react';
import { adminService } from '../../services/admin.service';

interface User {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  studentCategory: string | null;
  accountStatus: string;
  subscriptionTier: string;
  subscriptionStatus: string | null;
  createdAt: string;
  lastLogin: string | null;
  school: { id: string; name: string } | null;
}

type StatusFilter = 'all' | 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

interface UserFilters {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: UserFilters = { 
        page: pagination.page, 
        limit: pagination.limit 
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const response = await adminService.getAllUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.page, pagination.limit, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId);
      await adminService.approveUser(userId);
      showToast('User approved successfully!', 'success');
      loadUsers();
    } catch (err) {
      console.error('Approve error:', err);
      showToast('Failed to approve user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;
    
    try {
      setActionLoading(userId);
      await adminService.rejectUser(userId, reason);
      showToast('User rejected', 'info');
      loadUsers();
    } catch (err) {
      console.error('Reject error:', err);
      showToast('Failed to reject user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (userId: string) => {
    const reason = prompt('Reason for suspension:');
    if (!reason) return;
    
    try {
      setActionLoading(userId);
      await adminService.suspendUser(userId, reason);
      showToast('User suspended', 'info');
      loadUsers();
    } catch (err) {
      console.error('Suspend error:', err);
      showToast('Failed to suspend user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      setActionLoading(userId);
      await adminService.activateUser(userId);
      showToast('User activated successfully!', 'success');
      loadUsers();
    } catch (err) {
      console.error('Activate error:', err);
      showToast('Failed to activate user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactElement }> = {
      ACTIVE: { 
        bg: 'bg-green-50 border-green-200', 
        text: 'text-green-700',
        icon: <Check size={14} />
      },
      PENDING: { 
        bg: 'bg-yellow-50 border-yellow-200', 
        text: 'text-yellow-700',
        icon: <Clock size={14} />
      },
      SUSPENDED: { 
        bg: 'bg-red-50 border-red-200', 
        text: 'text-red-700',
        icon: <Ban size={14} />
      },
      REJECTED: { 
        bg: 'bg-gray-50 border-gray-200', 
        text: 'text-gray-700',
        icon: <X size={14} />
      }
    };
    const { bg, text, icon } = config[status] || config.ACTIVE;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${bg} ${text}`}>
        {icon}
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactElement }> = {
      SUPER_ADMIN: { 
        bg: 'bg-purple-50 border-purple-200', 
        text: 'text-purple-700',
        icon: <ShieldCheck size={14} />
      },
      SCHOOL_ADMIN: { 
        bg: 'bg-blue-50 border-blue-200', 
        text: 'text-blue-700',
        icon: <School size={14} />
      },
      TEACHER: { 
        bg: 'bg-indigo-50 border-indigo-200', 
        text: 'text-indigo-700',
        icon: <Users size={14} />
      },
      TUTOR: { 
        bg: 'bg-pink-50 border-pink-200', 
        text: 'text-pink-700',
        icon: <Users size={14} />
      },
      STUDENT: { 
        bg: 'bg-gray-50 border-gray-200', 
        text: 'text-gray-700',
        icon: <Users size={14} />
      }
    };
    const { bg, text, icon } = config[role] || config.STUDENT;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${bg} ${text}`}>
        {icon}
        {role.replace('_', ' ')}
      </span>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <Check size={20} />}
            {toast.type === 'error' && <X size={20} />}
            {toast.type === 'info' && <Activity size={20} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={28} />
                </div>
                User Management
              </h1>
              <p className="text-gray-600 mt-2 ml-15">
                {pagination.total} total users • {users.filter(u => u.accountStatus === 'PENDING').length} pending approval
              </p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="text-gray-400" size={20} />
              {(['all', 'ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User List */}
        {loading ? (
          <LoadingSkeleton />
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={`http://localhost:5000${user.avatar}`}
                          alt={user.firstName}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-2 border-white shadow-md">
                          <span className="text-white font-bold text-lg">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      {user.lastLogin && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">
                          {user.firstName} {user.lastName}
                        </h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {user.phone}
                          </span>
                        )}
                        {user.school && (
                          <span className="flex items-center gap-1">
                            <School size={14} />
                            {user.school.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(user.accountStatus)}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {actionLoading === user.id ? (
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {user.accountStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110"
                                title="Approve User"
                              >
                                <Check size={20} />
                              </button>
                              <button
                                onClick={() => handleReject(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                                title="Reject User"
                              >
                                <X size={20} />
                              </button>
                            </>
                          )}
                          {user.accountStatus === 'ACTIVE' && (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all hover:scale-110"
                              title="Suspend User"
                            >
                              <Ban size={20} />
                            </button>
                          )}
                          {user.accountStatus === 'SUSPENDED' && (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110"
                              title="Activate User"
                            >
                              <UserCheck size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hover:scale-110"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modern Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-semibold">{pagination.total}</span> users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination({ ...pagination, page })}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          pagination.page === page
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                {selectedUser.avatar ? (
                  <img
                    src={`http://localhost:5000${selectedUser.avatar}`}
                    alt={selectedUser.firstName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  <p className="font-semibold text-gray-900">{selectedUser.role.replace('_', ' ')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-semibold text-gray-900">{selectedUser.accountStatus}</p>
                </div>
                {selectedUser.phone && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.school && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">School</p>
                    <p className="font-semibold text-gray-900">{selectedUser.school.name}</p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Subscription</p>
                  <p className="font-semibold text-gray-900">{selectedUser.subscriptionTier}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Joined</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}