import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect PENDING_VERIFICATION users to dashboard which handles the pending view
  // or show a restricted view. Here we redirect to /dashboard which shows PendingVerificationDashboard
  if (user?.status !== 'ACTIVE' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Header />
      <div className="flex h-screen overflow-hidden bg-gray-50 pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </>
  );
}
