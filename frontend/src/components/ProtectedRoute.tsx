import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Assuming you have an auth hook

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectPath?: string;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectPath = '/login'
}: ProtectedRouteProps): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // Redirect to login page but save the attempted URL
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // If we're authenticated or the route doesn't require auth, render children
  return <>{children}</>;
};

export default ProtectedRoute;