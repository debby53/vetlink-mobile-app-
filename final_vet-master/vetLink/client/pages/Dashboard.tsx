import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import PendingVerificationDashboard from '@/components/PendingVerificationDashboard';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
            <div className="h-8 w-8 border-4 border-primary border-r-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check user status - non-active users see limited dashboard
  if (user.status && user.status !== 'ACTIVE') {
    // Non-admin users who are not ACTIVE see pending verification dashboard
    if (user.role !== 'admin') {
      return <PendingVerificationDashboard />;
    }
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'farmer':
      return <Navigate to="/dashboard/farmer" replace />;
    case 'veterinarian':
      return <Navigate to="/dashboard/veterinarian" replace />;
    case 'cahw':
      return <Navigate to="/dashboard/cahw" replace />;
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
