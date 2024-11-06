import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  // Check both user context and token
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute; 