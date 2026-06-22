import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Home, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 429) {
        setError('Too many requests. Please wait before trying again.');
      } else {
        setError(data?.msg || 'Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──
  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="glass-card verification-card">
            <div className="icon-container success">
              <CheckCircle size={36} />
            </div>
            <h2>Check Your Email</h2>
            <p>
              We've sent a password reset link to{' '}
              <span className="email-highlight">{email}</span>
            </p>
            <p>The link will expire in 30 minutes.</p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/login" className="btn btn-primary btn-block">
                Back to Login
              </Link>
              <button
                className="btn btn-ghost btn-block"
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
              >
                Send to a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="glass-card auth-card">
          <div className="auth-header">
            <div className="logo-icon">
              <Home size={26} color="white" />
            </div>
            <h1>Forgot Password</h1>
            <p>Enter your email and we'll send you a reset link</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
