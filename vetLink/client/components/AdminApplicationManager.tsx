import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Application {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  sector?: string;
  district?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  rejectionReason?: string;
  createdAt: string;
}

const AdminApplicationManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('PENDING_VERIFICATION');
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/applications/status/${selectedStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (userId: number) => {
    try {
      setActionInProgress(userId);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/applications/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve application');
      }

      // Refresh applications
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setActionInProgress(null);
    }
  };

  const rejectApplication = async (userId: number, reason: string) => {
    if (!reason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setActionInProgress(userId);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/applications/reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, rejectionReason: reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject application');
      }

      // Refresh applications
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'TRAINING_REQUIRED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Application Management</h2>
        <div className="flex gap-2 mb-6">
          {['PENDING_VERIFICATION', 'TRAINING_REQUIRED', 'ACTIVE', 'SUSPENDED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
          <AlertCircle className="inline mr-2" size={20} />
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No applications found for this status.
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                  <p className="text-sm text-gray-500">{app.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                  {app.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Sector</p>
                  <p className="text-sm text-gray-900">{app.sector || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">District</p>
                  <p className="text-sm text-gray-900">{app.district || 'N/A'}</p>
                </div>

                {app.specialization && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Specialization</p>
                    <p className="text-sm text-gray-900">{app.specialization}</p>
                  </div>
                )}

                {app.licenseNumber && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">License Number</p>
                    <p className="text-sm text-gray-900">{app.licenseNumber}</p>
                  </div>
                )}
              </div>

              {app.rejectionReason && (
                <div className="p-3 bg-red-100 border border-red-300 rounded mb-4">
                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-red-700 text-sm">{app.rejectionReason}</p>
                </div>
              )}

              {selectedStatus === 'PENDING_VERIFICATION' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveApplication(app.id)}
                    disabled={actionInProgress === app.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Please provide a rejection reason:');
                      if (reason) rejectApplication(app.id, reason);
                    }}
                    disabled={actionInProgress === app.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}

              {selectedStatus === 'TRAINING_REQUIRED' && (
                <button
                  onClick={() => approveApplication(app.id)}
                  disabled={actionInProgress === app.id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Activate User
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminApplicationManager;
