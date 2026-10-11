import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Route guard restricting access strictly to users with role 'admin'
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying administrative privileges..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If authenticated but not admin, bounce back to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
