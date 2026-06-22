import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.msg || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.msg || 'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="glass-card verification-card">
          {status === 'loading' && (
            <>
              <div className="icon-container pending">
                <Loader size={36} className="spin-icon" />
              </div>
              <h2>Verifying Your Email...</h2>
              <p>Please wait while we confirm your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="icon-container success">
                <CheckCircle size={36} />
              </div>
              <h2>Email Verified!</h2>
              <p>{message}</p>
              <div style={{ marginTop: 24 }}>
                <Link to="/login" className="btn btn-primary btn-block">
                  Continue to Login
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="icon-container error">
                <XCircle size={36} />
              </div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/login" className="btn btn-primary btn-block">
                  Go to Login
                </Link>
                <Link to="/register" className="btn btn-ghost btn-block">
                  Create New Account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
