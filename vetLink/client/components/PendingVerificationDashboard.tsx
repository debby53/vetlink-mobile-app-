import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { API_BASE } from '@/lib/apiConfig';
import AdminApplicationManager from './AdminApplicationManager';
import CAHWApplicationManager from './CAHWApplicationManager';

interface UserStatus {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  statusDescription: string;
  sector?: string;
  district?: string;
  assignedVeterinarianName?: string;
  rejectionReason?: string;
}

const PendingVerificationDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStatus();
  }, []);

  const fetchUserStatus = async () => {
    try {
      if (!token) {
        setError('Please wait for the approval from our team');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/user/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user status');
      }

      const data = await response.json();
      setUserStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !userStatus) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="text-red-600 mb-2" size={24} />
        <p className="text-red-800">{error || 'Unable to load user status'}</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return <Clock className="text-yellow-600" size={24} />;
      case 'TRAINING_REQUIRED':
        return <AlertCircle className="text-blue-600" size={24} />;
      case 'ACTIVE':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'SUSPENDED':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return <AlertCircle className="text-gray-600" size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-50 border-yellow-200';
      case 'TRAINING_REQUIRED':
        return 'bg-blue-50 border-blue-200';
      case 'ACTIVE':
        return 'bg-green-50 border-green-200';
      case 'SUSPENDED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return 'text-yellow-800';
      case 'TRAINING_REQUIRED':
        return 'text-blue-800';
      case 'ACTIVE':
        return 'text-green-800';
      case 'SUSPENDED':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* User Status Card */}
        <div className={`p-8 rounded-lg border-2 ${getStatusColor(userStatus.status)}`}>
          <div className="flex items-center justify-center mb-6">
            {getStatusIcon(userStatus.status)}
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
            Application Status
          </h1>

          <div className={`text-center mb-6 p-4 rounded-lg bg-white bg-opacity-60 ${getTextColor(userStatus.status)}`}>
            <p className="text-lg font-semibold">{userStatus.status.replace(/_/g, ' ')}</p>
            <p className="text-sm mt-1">{userStatus.statusDescription}</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="text-gray-900">{userStatus.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{userStatus.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Role</p>
              <p className="text-gray-900 capitalize">{userStatus.role.toLowerCase()}</p>
            </div>

            {userStatus.sector && (
              <div>
                <p className="text-sm font-medium text-gray-600">Sector</p>
                <p className="text-gray-900">{userStatus.sector}</p>
              </div>
            )}

            {userStatus.district && (
              <div>
                <p className="text-sm font-medium text-gray-600">District</p>
                <p className="text-gray-900">{userStatus.district}</p>
              </div>
            )}

            {userStatus.assignedVeterinarianName && (
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Veterinarian</p>
                <p className="text-gray-900">{userStatus.assignedVeterinarianName}</p>
              </div>
            )}

            {userStatus.rejectionReason && (
              <div className="p-3 bg-red-100 rounded-lg border border-red-300">
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-red-700 text-sm mt-1">{userStatus.rejectionReason}</p>
              </div>
            )}
          </div>

          {userStatus.status === 'PENDING_VERIFICATION' && (
            <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-sm text-blue-800">
                Your account is currently unauthorized. Please wait for the approval from our team.
              </p>
            </div>
          )}

          {userStatus.status === 'TRAINING_REQUIRED' && (
            <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-sm text-blue-800">
                Your application has been approved! Please complete the required training to activate your account.
              </p>
            </div>
          )}

          {userStatus.status === 'SUSPENDED' && (
            <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-300">
              <p className="text-sm text-red-800">
                Your account has been suspended. Please contact support for more information.
              </p>
            </div>
          )}
        </div>

        {/* Admin Panel - Only for admins to manage veterinarians */}
        {user?.role === 'admin' && (
          <div className="p-8 rounded-lg border border-gray-200 bg-white">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Admin Controls</h2>
            <AdminApplicationManager />
          </div>
        )}

        {/* CAHW Approval Manager - For veterinarians to approve CAHWs in their sector */}
        {user?.role === 'veterinarian' && (
          <div className="p-8 rounded-lg border border-gray-200 bg-white">
            <h2 className="text-xl font-bold mb-6 text-gray-900">CAHW Approvals</h2>
            <CAHWApplicationManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingVerificationDashboard;
