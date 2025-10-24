import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Check, 
  X, 
  Ban, 
  UserCheck,
  Phone,
  Calendar,
  School,
  Eye,
  ShieldCheck,
  Clock,
  Activity,
  ChevronDown
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
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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
    setShowFilterMenu(false);
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
      <span className={`inline-flex items-center gap-1 px-2 xs:px-3 py-1 rounded-full text-xs font-medium border ${bg} ${text}`}>
        {icon}
        <span className="hidden xs:inline">{status}</span>
        <span className="xs:hidden">{status.slice(0, 3)}</span>
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
        icon: <Activity size={14} />
      },
      STUDENT: { 
        bg: 'bg-emerald-50 border-emerald-200', 
        text: 'text-emerald-700',
        icon: <Users size={14} />
      }
    };
    const { bg, text, icon } = config[role] || config.STUDENT;
    return (
      <span className={`inline-flex items-center gap-1 px-2 xs:px-3 py-1 rounded-full text-xs font-medium border ${bg} ${text}`}>
        {icon}
        <span className="hidden xs:inline">{role.replace('_', ' ')}</span>
        <span className="xs:hidden">{role.slice(0, 3)}</span>
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications - Mobile Responsive */}
      <div className="fixed top-4 xs:top-6 right-2 xs:right-4 z-50 space-y-2 max-w-xs xs:max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-3 xs:p-4 rounded-lg xs:rounded-xl text-sm xs:text-base font-medium text-white shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header Section - Mobile Responsive */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-4 xs:py-6">
          <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6">
            <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="text-white" size={18} />
            </div>
            <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              Manage Users
            </h1>
          </div>

          {/* Search & Filters - Mobile Responsive */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 items-stretch xs:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 xs:top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full pl-10 pr-3 xs:pr-4 py-2 xs:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm xs:text-base"
              />
            </div>

            {/* Filter Dropdown - Mobile Responsive */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-2 xs:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl hover:border-gray-400 transition-all bg-white text-sm xs:text-base font-medium text-gray-700"
              >
                <Filter size={18} />
                <span className="hidden xs:inline">Filter</span>
                <ChevronDown size={16} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>

              {showFilterMenu && (
                <div className="absolute top-full mt-1 xs:mt-2 right-0 z-40 bg-white border-2 border-gray-300 rounded-lg xs:rounded-xl shadow-lg min-w-40 xs:min-w-48">
                  {(['all', 'ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'] as StatusFilter[]).map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterMenu(false);
                        setPagination({ ...pagination, page: 1 });
                      }}
                      className={`w-full text-left px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base transition-all ${
                        statusFilter === status
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-4 xs:py-6">
        {/* Users List - Mobile Card View / Desktop Table View */}
        {users.length > 0 ? (
          <div className="space-y-2 xs:space-y-3">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-white rounded-lg xs:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-3 xs:p-4"
              >
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-2 xs:space-y-3">
                  {/* User Header */}
                  <div className="flex items-start gap-2 xs:gap-3 mb-2 xs:mb-3">
                    {user.avatar ? (
                      <img
                        src={`http://localhost:5000${user.avatar}`}
                        alt={user.firstName}
                        className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs xs:text-sm">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm xs:text-base text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs xs:text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Status & Role Badges */}
                  <div className="flex flex-wrap gap-1.5 xs:gap-2">
                    {getStatusBadge(user.accountStatus)}
                    {getRoleBadge(user.role)}
                  </div>

                  {/* User Info */}
                  <div className="space-y-1 text-xs xs:text-sm text-gray-600">
                    {user.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="flex-shrink-0" />
                        <span className="truncate">{user.phone}</span>
                      </div>
                    )}
                    {user.school && (
                      <div className="flex items-center gap-1.5">
                        <School size={14} className="flex-shrink-0" />
                        <span className="truncate">{user.school.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 xs:gap-2 pt-2 xs:pt-3 border-t border-gray-200">
                    {actionLoading === user.id ? (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="flex gap-1 xs:gap-2 flex-wrap">
                        {user.accountStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="flex-1 p-2 xs:p-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg xs:rounded-lg transition-all text-xs xs:text-sm font-medium"
                              title="Approve"
                            >
                              <Check size={16} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="flex-1 p-2 xs:p-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg xs:rounded-lg transition-all text-xs xs:text-sm font-medium"
                              title="Reject"
                            >
                              <X size={16} className="mx-auto" />
                            </button>
                          </>
                        )}
                        {user.accountStatus === 'ACTIVE' && (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="flex-1 p-2 xs:p-2.5 text-white bg-orange-600 hover:bg-orange-700 rounded-lg xs:rounded-lg transition-all text-xs xs:text-sm font-medium"
                            title="Suspend"
                          >
                            <Ban size={16} className="mx-auto" />
                          </button>
                        )}
                        {user.accountStatus === 'SUSPENDED' && (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="flex-1 p-2 xs:p-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg xs:rounded-lg transition-all text-xs xs:text-sm font-medium"
                            title="Activate"
                          >
                            <UserCheck size={16} className="mx-auto" />
                          </button>
                        )}
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="flex-1 p-2 xs:p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg xs:rounded-lg transition-all text-xs xs:text-sm font-medium"
                          title="View Details"
                        >
                          <Eye size={16} className="mx-auto" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:flex items-center gap-3 justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {user.avatar ? (
                      <img
                        src={`http://localhost:5000${user.avatar}`}
                        alt={user.firstName}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 flex-wrap">
                        <span className="truncate">{user.email}</span>
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

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex gap-2">
                      {getStatusBadge(user.accountStatus)}
                      {getRoleBadge(user.role)}
                    </div>

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
        ) : (
          <div className="text-center py-8 xs:py-12">
            <Users className="mx-auto mb-3 xs:mb-4 text-gray-400" size={32} />
            <p className="text-gray-600 text-sm xs:text-base">No users found</p>
          </div>
        )}

        {/* Pagination - Mobile Responsive */}
        {pagination.pages > 1 && (
          <div className="mt-6 xs:mt-8 bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 p-3 xs:p-4">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
              <p className="text-xs xs:text-sm text-gray-600">
                Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-semibold">{pagination.total}</span> users
              </p>
              <div className="flex gap-1 xs:gap-2 flex-wrap">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-2 xs:px-4 py-1 xs:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs xs:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                >
                  Prev
                </button>
                <div className="flex items-center gap-0.5 xs:gap-1">
                  {[...Array(Math.min(3, pagination.pages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination({ ...pagination, page })}
                        className={`w-8 h-8 xs:w-10 xs:h-10 rounded-lg text-xs xs:text-sm font-medium transition-all ${
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
                  className="px-2 xs:px-4 py-1 xs:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs xs:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal - Mobile Responsive */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 xs:p-4">
          <div className="bg-white rounded-lg xs:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-3 xs:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-base xs:text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 xs:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 xs:p-6 space-y-4 xs:space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-3 xs:gap-4">
                {selectedUser.avatar ? (
                  <img
                    src={`http://localhost:5000${selectedUser.avatar}`}
                    alt={selectedUser.firstName}
                    className="w-16 h-16 xs:w-20 xs:h-20 rounded-lg xs:rounded-2xl object-cover border-2 border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-lg xs:rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl xs:text-2xl">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base xs:text-xl font-bold text-gray-900 truncate">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-xs xs:text-base text-gray-600 truncate">{selectedUser.email}</p>
                </div>
              </div>

              {/* Details Grid - Mobile Responsive */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-4">
                <div className="p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Role</p>
                  <p className="font-semibold text-sm xs:text-base text-gray-900">{selectedUser.role.replace('_', ' ')}</p>
                </div>
                <div className="p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <p className="font-semibold text-sm xs:text-base text-gray-900">{selectedUser.accountStatus}</p>
                </div>
                {selectedUser.phone && (
                  <div className="p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-sm xs:text-base text-gray-900">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.school && (
                  <div className="p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">School</p>
                    <p className="font-semibold text-sm xs:text-base text-gray-900">{selectedUser.school.name}</p>
                  </div>
                )}
                <div className="p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Subscription</p>
                  <p className="font-semibold text-sm xs:text-base text-gray-900">{selectedUser.subscriptionTier}</p>
                </div>
                <div className="p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Joined</p>
                  <p className="font-semibold text-sm xs:text-base text-gray-900">
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