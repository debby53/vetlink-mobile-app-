import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CAHWApplication {
  id: number;
  name: string;
  email: string;
  sector: string;
  district?: string;
  status: string;
  createdAt: string;
  rejectionReason?: string;
}

export default function CAHWApplicationManager() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [cahwApplications, setCAHWApplications] = useState<CAHWApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalReason, setApprovalReason] = useState<Record<number, string>>({});
  const [rejectionReason, setRejectionReason] = useState<Record<number, string>>({});

  // Only show if user is a veterinarian
  if (!user || (user.role !== 'veterinarian' && user.role !== 'admin')) {
    return null;
  }

  useEffect(() => {
    fetchPendingCAHWs();
  }, []);

  const fetchPendingCAHWs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cahw-applications/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CAHW applications');
      }

      const data = await response.json();
      setCAHWApplications(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CAHW applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (cahwId: number) => {
    try {
      const response = await fetch(`/api/cahw-applications/${cahwId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: approvalReason[cahwId] || '' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve CAHW');
      }

      toast.success('CAHW approved successfully!');
      setCAHWApplications(cahwApplications.filter(c => c.id !== cahwId));
      setApprovalReason({ ...approvalReason, [cahwId]: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve CAHW');
    }
  };

  const handleReject = async (cahwId: number) => {
    if (!rejectionReason[cahwId] || rejectionReason[cahwId].trim() === '') {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`/api/cahw-applications/${cahwId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason: rejectionReason[cahwId] }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject CAHW');
      }

      toast.success('CAHW rejected successfully!');
      setCAHWApplications(cahwApplications.filter(c => c.id !== cahwId));
      setRejectionReason({ ...rejectionReason, [cahwId]: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject CAHW');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
          <div className="h-8 w-8 border-4 border-primary border-r-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  if (cahwApplications.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
        <CheckCircle className="h-12 w-12 text-success/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No pending CAHW applications in your sector</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Pending CAHW Applications in Your Sector</h3>

      {cahwApplications.map((cahw) => (
        <div key={cahw.id} className="rounded-lg border border-border bg-white p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium text-foreground">{cahw.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-foreground">{cahw.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sector</p>
              <p className="font-medium text-foreground">{cahw.sector}</p>
            </div>
            {cahw.district && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">District</p>
                <p className="font-medium text-foreground">{cahw.district}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                value={approvalReason[cahw.id] || ''}
                onChange={(e) => setApprovalReason({ ...approvalReason, [cahw.id]: e.target.value })}
                placeholder="Add any notes about this CAHW approval..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                value={rejectionReason[cahw.id] || ''}
                onChange={(e) => setRejectionReason({ ...rejectionReason, [cahw.id]: e.target.value })}
                placeholder="Explain why you're rejecting this application..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleApprove(cahw.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-success text-white px-4 py-2 font-medium transition-all hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => handleReject(cahw.id)}
                disabled={!rejectionReason[cahw.id] || rejectionReason[cahw.id].trim() === ''}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-destructive text-white px-4 py-2 font-medium transition-all hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
