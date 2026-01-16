import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Spinner } from '@/components/ui';

interface PublicRouteProps {
  children: JSX.Element;
}

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
export const PublicRoute = ({ children }: PublicRouteProps): JSX.Element => {
  const { isAuthenticated, isLoading, requires2FA } = useAuth();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated (and not in 2FA flow)
  if (isAuthenticated && !requires2FA) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
