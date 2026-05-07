import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminProtectedRoute({ children }) {
  const { isAdmin, isLoading, adminSessionActive } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!adminSessionActive || !isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
}
