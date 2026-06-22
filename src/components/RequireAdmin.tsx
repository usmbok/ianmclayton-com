import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEV_BYPASS = import.meta.env.VITE_DEV_ADMIN_BYPASS === 'true';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, profileLoading, session, isAdmin } = useAuth();
  const location = useLocation();

  if (DEV_BYPASS) return <>{children}</>;

  // Spin while initial auth loads OR while profile is being fetched after login
  if (loading || (session && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
