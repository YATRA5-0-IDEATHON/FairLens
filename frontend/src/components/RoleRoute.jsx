import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    const home = user.role === 'employee' ? '/employee' : user.role === 'executive' ? '/executive' : '/dashboard';
    return <Navigate to={home} replace />;
  }
  return children;
}
