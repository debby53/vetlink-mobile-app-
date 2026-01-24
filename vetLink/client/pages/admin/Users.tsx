import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { userAPI } from '@/lib/apiService';
import { Plus, Search, Edit, Trash2, Lock, Unlock, Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FARMER',
    phone: '',
    sector: '',
    district: '',
    specialization: '',
    licenseNumber: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await userAPI.getActiveUsers();
      setUsers(allUsers);
    } catch (err: any) {
      console.error('Error loading users:', err);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockUser = async (userId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await userAPI.lockUser(userId);
        toast.success('User locked');
      } else {
        await userAPI.unlockUser(userId);
        toast.success('User unlocked');
      }
      loadUsers();
    } catch (err: any) {
      toast.error('Failed to update user status');
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await userAPI.approveUser(userId);
      toast.success('User approved successfully');
      loadUsers();
    } catch (err: any) {
      console.error('Error approving user:', err);
      toast.error('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await userAPI.rejectUser(userId, reason);
      toast.success('User rejected');
      loadUsers();
    } catch (err: any) {
      console.error('Error rejecting user:', err);
      toast.error('Failed to reject user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm(t('confirmDeleteUser') || 'Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (err: any) {
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.createUser(newUser);
      toast.success('User created successfully');
      setIsAddUserModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'FARMER',
        phone: '',
        sector: '',
        district: '',
        specialization: '',
        licenseNumber: ''
      });
      loadUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast.error(err.message || 'Failed to create user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    farmer: 'bg-green-100 text-green-800',
    veterinarian: 'bg-blue-100 text-blue-800',
    cahw: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t('userManagement')}</h1>
            <p className="text-muted-foreground mt-1">{t('manageSystemUsers')}</p>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="h-5 w-5" />
            {t('addUser')}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchUsersPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'farmer', 'veterinarian', 'cahw'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${roleFilter === role
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
                  }`}
              >
                {t(role === 'all' ? 'allRoles' : role)}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {t('name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {t('role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {t('joinedDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {t('action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground text-sm">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[user.role?.toLowerCase() as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {t(user.role?.toLowerCase() || 'user')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'ACTIVE' || user.active === true
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-800'
                            : user.status === 'TRAINING_REQUIRED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {user.status ? user.status.replace(/_/g, ' ') : (user.active ? 'ACTIVE' : 'INACTIVE')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {(() => {
                        const dateVal = user.createdAt || user.joinDate;
                        if (!dateVal) return 'N/A';
                        const dateKey = new Date(dateVal);
                        return isNaN(dateKey.getTime()) ? 'N/A' : dateKey.toLocaleDateString();
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {(user.status === 'PENDING_VERIFICATION' || user.status === 'TRAINING_REQUIRED') && (
                          <>
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-all text-green-600"
                              title="Approve User"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectUser(user.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-600"
                              title="Reject User"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-primary" title={t('edit')}>
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleLockUser(user.id, user.isActive)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all text-orange-500"
                          title={user.isActive ? t('lockUser') : t('unlockUser')}
                        >
                          {user.isActive ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-500"
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t('addUser')}</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded-lg"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full p-2 border rounded-lg"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full p-2 border rounded-lg"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="FARMER">Farmer</option>
                    <option value="VETERINARIAN">Veterinarian</option>
                    <option value="CAHW">CAHW</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {(newUser.role === 'VETERINARIAN' || newUser.role === 'CAHW') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sector</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded-lg"
                        value={newUser.sector}
                        onChange={(e) => setNewUser({ ...newUser, sector: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">District</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded-lg"
                        value={newUser.district}
                        onChange={(e) => setNewUser({ ...newUser, district: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {newUser.role === 'VETERINARIAN' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Specialization</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={newUser.specialization}
                        onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">License Number</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={newUser.licenseNumber}
                        onChange={(e) => setNewUser({ ...newUser, licenseNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
