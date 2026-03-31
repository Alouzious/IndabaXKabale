import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { normalizeRole } from '../utils';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();
  const currentRole = normalizeRole(user?.role);
  const requiredRole = normalizeRole(role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    requiredRole &&
    currentRole !== requiredRole &&
    !(requiredRole === 'cabinet' && currentRole === 'super_admin')
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
