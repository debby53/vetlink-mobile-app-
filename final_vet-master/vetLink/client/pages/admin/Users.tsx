import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { userAPI } from '@/lib/apiService';
import {
  Plus, Search, Edit, Trash2, Lock, Unlock, Check, X, Eye,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import LocationSelector from '@/components/LocationSelector';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function AdminUsers() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FARMER',
    phone: '',
    specialization: '',
    licenseNumber: ''
  });

  // Edit User State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // View User State
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [userToReject, setUserToReject] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectingUser, setIsRejectingUser] = useState(false);

  // Location state for the add/edit user form
  const [locationState, setLocationState] = useState<{
    cellId: number | null;
    sector: string;
    district: string;
  }>({ cellId: null, sector: '', district: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await userAPI.getActiveUsers();
      setUsers(allUsers || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockUser = async (userId: number, currentStatus: boolean) => {
    try {
      // If currentStatus (isActive) is true, we want to LOCK (set to false)
      if (currentStatus) {
        await userAPI.lockUser(userId);
        toast.success('User locked successfully');
      } else {
        await userAPI.unlockUser(userId);
        toast.success('User unlocked successfully');
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
    const selectedUser = users.find((candidate) => candidate.id === userId);
    if (!selectedUser) {
      toast.error('User not found');
      return;
    }

    setUserToReject(selectedUser);
    setRejectionReason(selectedUser.rejectionReason || '');
  };

  const confirmRejectUser = async () => {
    if (!userToReject) {
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsRejectingUser(true);
      await userAPI.rejectUser(userToReject.id, rejectionReason);
      toast.success('User rejected');
      setUserToReject(null);
      setRejectionReason('');
      loadUsers();
    } catch (err: any) {
      console.error('Error rejecting user:', err);
      toast.error(err.message || 'Failed to reject user');
    } finally {
      setIsRejectingUser(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeletingUser(true);
      await userAPI.deleteUser(userToDelete.id);
      toast.success('User deleted successfully');
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationState.cellId) {
      toast.error('Please select a location');
      return;
    }

    try {
      const userData = {
        ...newUser,
        sector: locationState.sector,
        district: locationState.district,
        cellId: locationState.cellId
      };

      await userAPI.createUser(userData);
      toast.success('User created successfully');
      setIsAddUserModalOpen(false);

      // Reset
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'FARMER',
        phone: '',
        specialization: '',
        licenseNumber: ''
      });
      setLocationState({ cellId: null, sector: '', district: '' });
      loadUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast.error(err.message || 'Failed to create user');
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser({
      ...user,
      password: '' // Don't allow editing password via this form usually, or handled separately
    });
    // If user has location info, trying to pre-fill it is complex with LocationSelector 
    // without fetching parent hierarchy. For now, we leave location as is unless changed.
    setLocationState({
      cellId: user.locationId || null,
      sector: user.sector || '',
      district: user.district || ''
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...editingUser };

      // Only include location if it was specifically changed (checked via cellId change)
      // For simplicity API assumes we send what we want to update. 
      if (locationState.cellId && locationState.cellId !== editingUser.locationId) {
        payload.locationId = locationState.cellId;
        payload.sector = locationState.sector;
        payload.district = locationState.district;
      }

      await userAPI.updateUser(editingUser.id, payload);
      toast.success('User updated successfully');
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error('Failed to update user');
    }
  };

  const openViewModal = (user: any) => {
    setViewingUser(user);
    setIsViewUserModalOpen(true);
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatJoinedDate = (dateVal: any) => {
    if (!dateVal) return 'Recently';
    // Handle array format [yyyy, mm, dd...]
    if (Array.isArray(dateVal)) {
      return new Date(dateVal[0], dateVal[1] - 1, dateVal[2]).toLocaleDateString();
    }
    const dateKey = new Date(dateVal);
    // If invalid date
    if (isNaN(dateKey.getTime())) return 'Recently';
    return dateKey.toLocaleDateString();
  };

  const roleColors = {
    farmer: 'bg-green-100 text-green-800',
    veterinarian: 'bg-blue-100 text-blue-800',
    cahw: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
  };

  // Helper to determine status Badge
  const getStatusBadge = (user: any) => {
    if (user.active === false) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">INACTIVE</span>;
    }

    // Prefer explicit backend status first
    const status = user.status || 'ACTIVE';
    let colorClass = 'bg-gray-100 text-gray-800';

    if (status === 'ACTIVE') colorClass = 'bg-green-100 text-green-800';
    else if (status === 'SUSPENDED') colorClass = 'bg-red-100 text-red-800';
    else if (status === 'TRAINING_REQUIRED') colorClass = 'bg-blue-100 text-blue-800';
    else if (status === 'PENDING_VERIFICATION') colorClass = 'bg-yellow-100 text-yellow-800';

    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {status.replace(/_/g, ' ')}
    </span>;
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'farmer', 'veterinarian', 'cahw'].map((role) => (
              <button
                key={role}
                onClick={() => { setRoleFilter(role); setCurrentPage(1); }}
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('email')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('role')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('joinedDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">Loading users...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">No users found</td></tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground text-sm">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[user.role?.toLowerCase() as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
                        {t(user.role?.toLowerCase() || 'user')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatJoinedDate(user.createdAt || user.joinDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {/* Approve/Reject for specific statuses */}
                        {(user.status === 'PENDING_VERIFICATION' || user.status === 'TRAINING_REQUIRED') && (
                          <>
                            <button onClick={() => handleApproveUser(user.id)} className="p-2 hover:bg-green-50 rounded-lg transition-all text-green-600" title="Approve User">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleRejectUser(user.id)} className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-600" title="Reject User">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <button onClick={() => openEditModal(user)} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-primary" title={t('edit')}>
                          <Edit className="h-4 w-4" />
                        </button>

                        <button onClick={() => openViewModal(user)} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-blue-500" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleLockUser(user.id, user.active)}
                          className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${!user.active ? 'text-red-500' : 'text-orange-500'}`}
                          title={user.active ? t('lockUser') : t('unlockUser')}
                        >
                          {user.active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>

                        <button onClick={() => handleDeleteUser(user)} className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-500" title={t('delete')}>
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

        {/* Pagination Controls */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="flex items-center px-4 text-sm font-medium">Page {currentPage} of {Math.max(1, totalPages)}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t('addUser')}</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* Form Fields: Name, Email, Password, Phone */}
                {['name', 'email', 'password', 'phone'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
                    <input
                      type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                      required
                      className="w-full p-2 border rounded-lg"
                      value={(newUser as any)[field]}
                      onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
                    />
                  </div>
                ))}

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

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <LocationSelector
                    onLocationSelect={(cellId, sectorName, districtName) => {
                      setLocationState({
                        cellId,
                        sector: sectorName || '',
                        district: districtName || ''
                      });
                    }}
                    label="Select Location"
                  />
                  {locationState.sector && (
                    <p className="text-sm text-green-600 mt-2">✓ {locationState.sector}, {locationState.district}</p>
                  )}
                </div>

                {newUser.role === 'VETERINARIAN' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Specialization</label>
                      <input type="text" className="w-full p-2 border rounded-lg" value={newUser.specialization} onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">License Number</label>
                      <input type="text" className="w-full p-2 border rounded-lg" value={newUser.licenseNumber} onChange={(e) => setNewUser({ ...newUser, licenseNumber: e.target.value })} />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete User Permanently
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  You are about to permanently delete <span className="font-semibold text-foreground">{userToDelete?.name}</span>.
                </span>
                <span className="block">
                  This action removes the user and related records from the database and cannot be undone.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingUser}>
                {t('cancel') || 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700" disabled={isDeletingUser}>
                {isDeletingUser ? 'Deleting...' : (t('delete') || 'Delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!userToReject} onOpenChange={(open) => !open && !isRejectingUser && setUserToReject(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                Reject User
              </DialogTitle>
              <DialogDescription>
                Add a reason for rejecting this account so the user understands what needs to change before approval.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="font-semibold text-foreground">{userToReject?.name}</p>
                <p className="text-sm text-muted-foreground">{userToReject?.email}</p>
              </div>
              <Textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain why this account cannot be approved right now..."
                className="min-h-[120px]"
                disabled={isRejectingUser}
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => {
                  if (!isRejectingUser) {
                    setUserToReject(null);
                    setRejectionReason('');
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={isRejectingUser}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRejectUser}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isRejectingUser}
              >
                {isRejectingUser ? 'Rejecting...' : 'Reject User'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        {isEditUserModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit User</h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" required className="w-full p-2 border rounded-lg"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" required className="w-full p-2 border rounded-lg"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select className="w-full p-2 border rounded-lg" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                    <option value="FARMER">Farmer</option>
                    <option value="VETERINARIAN">Veterinarian</option>
                    <option value="CAHW">CAHW</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Update Location (Optional)</label>
                  <LocationSelector
                    onLocationSelect={(cellId, sectorName, districtName) => {
                      setLocationState({ cellId, sector: sectorName || '', district: districtName || '' });
                    }}
                    label="Change Location"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {isViewUserModalOpen && viewingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg relative">
              <button
                onClick={() => setIsViewUserModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>

              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold">{viewingUser.name}</h2>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[viewingUser.role?.toLowerCase() as keyof typeof roleColors] || 'bg-gray-100'}`}>
                  {viewingUser.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Email</h3>
                    <p className="text-foreground">{viewingUser.email}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Phone</h3>
                    <p className="text-foreground">{viewingUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Status</h3>
                    <p className="text-foreground">{viewingUser.active ? 'Active' : 'Inactive'} ({viewingUser.status})</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Joined Date</h3>
                    <p className="text-foreground">{formatJoinedDate(viewingUser.createdAt || viewingUser.joinDate)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {viewingUser.locationName ? (
                      <p className="font-medium">{viewingUser.locationName}</p>
                    ) : (viewingUser.sector || viewingUser.district) ? (
                      <p className="font-medium">{viewingUser.sector}, {viewingUser.district}</p>
                    ) : <p className="text-gray-400 italic">No location set</p>}
                  </div>
                </div>

                {viewingUser.role === 'VETERINARIAN' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase">Specialization</h3>
                      <p className="text-foreground">{viewingUser.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase">License</h3>
                      <p className="text-foreground">{viewingUser.licenseNumber || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-8">
                <button onClick={() => setIsViewUserModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
