import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader/Loader';

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * If the auth session is still loading (e.g. page refresh), shows a full-screen
 * loader to avoid a flash-redirect while the token is being verified.
 *
 * If not authenticated, redirects to /login and stores the original destination
 * in location.state.from so Login can redirect back after success.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
