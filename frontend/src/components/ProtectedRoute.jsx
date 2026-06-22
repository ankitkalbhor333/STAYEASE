import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
            <div className="btn spinner" style={{ margin: '40px auto', width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-400)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
