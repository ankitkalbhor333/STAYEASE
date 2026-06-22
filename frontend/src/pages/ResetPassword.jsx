import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Lock,
  Eye,
  EyeOff,
  Home,
  AlertCircle,
  CheckCircle,
  XCircle,
  Check,
  X,
} from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Password checks ──
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
  }, [password]);

  const passwordStrength = useMemo(() => {
    const met = Object.values(passwordChecks).filter(Boolean).length;
    if (met <= 1) return { level: 'weak', label: 'Weak', bars: 1 };
    if (met <= 2) return { level: 'fair', label: 'Fair', bars: 2 };
    if (met <= 4) return { level: 'good', label: 'Good', bars: 3 };
    return { level: 'strong', label: 'Strong', bars: 4 };
  }, [passwordChecks]);

  const allMet = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allMet) {
      setError('Password does not meet all requirements.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/auth/reset-password/${token}`, {
        newPassword: password,
      });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 429) {
        setError('Too many attempts. Please wait before trying again.');
      } else if (data?.errors && Array.isArray(data.errors)) {
        setError(data.errors.join('. '));
      } else {
        setError(data?.msg || 'Failed to reset password. The link may have expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── No token ──
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="glass-card verification-card">
            <div className="icon-container error">
              <XCircle size={36} />
            </div>
            <h2>Invalid Link</h2>
            <p>This password reset link is invalid or missing a token.</p>
            <div style={{ marginTop: 24 }}>
              <Link to="/forgot-password" className="btn btn-primary btn-block">
                Request a New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="glass-card verification-card">
            <div className="icon-container success">
              <CheckCircle size={36} />
            </div>
            <h2>Password Reset!</h2>
            <p>Your password has been successfully updated. You can now sign in with your new password.</p>
            <div style={{ marginTop: 24 }}>
              <Link to="/login" className="btn btn-primary btn-block">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="glass-card auth-card">
          <div className="auth-header">
            <div className="logo-icon">
              <Home size={26} color="white" />
            </div>
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-password">New Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength Meter */}
              {password && (
                <>
                  <div className="strength-meter">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`strength-bar ${
                          i <= passwordStrength.bars
                            ? `active ${passwordStrength.level}`
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label ${passwordStrength.level}`}>
                    {passwordStrength.label}
                  </span>
                </>
              )}

              {/* Requirements */}
              <ul className="password-requirements">
                {[
                  { key: 'length', label: 'At least 8 characters' },
                  { key: 'upper', label: 'One uppercase letter (A-Z)' },
                  { key: 'lower', label: 'One lowercase letter (a-z)' },
                  { key: 'number', label: 'One number (0-9)' },
                  { key: 'special', label: 'One special character (!@#$...)' },
                ].map(({ key, label }) => (
                  <li key={key} className={passwordChecks[key] ? 'met' : ''}>
                    {passwordChecks[key] ? <Check size={12} /> : <X size={12} />}
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || !allMet}
            >
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
