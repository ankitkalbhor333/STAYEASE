import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Home,
  Check,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [registered, setRegistered] = useState(false);

  // ── Client-side validation ──
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;

  const passwordChecks = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
    };
  }, [form.password]);

  const passwordStrength = useMemo(() => {
    const met = Object.values(passwordChecks).filter(Boolean).length;
    if (met <= 1) return { level: 'weak', label: 'Weak', bars: 1 };
    if (met <= 2) return { level: 'fair', label: 'Fair', bars: 2 };
    if (met <= 4) return { level: 'good', label: 'Good', bars: 3 };
    return { level: 'strong', label: 'Strong', bars: 4 };
  }, [passwordChecks]);

  const allPasswordChecksMet = Object.values(passwordChecks).every(Boolean);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!emailRegex.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!phoneRegex.test(form.phone)) errs.phone = 'Enter a valid phone number';
    if (!allPasswordChecksMet) errs.password = 'Password does not meet all requirements';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', form);

      // If backend returns a token (auto-login), store it
      if (res.data.token && res.data.user) {
        login(res.data.token, res.data.user, false);
      }

      // Show verification pending status
      setRegistered(true);
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else if (data?.errors && Array.isArray(data.errors)) {
        setError(data.errors.join('. '));
      } else {
        setError(data?.msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Verification Pending State ──
  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="glass-card verification-card">
            <div className="icon-container pending">
              <Clock size={36} />
            </div>
            <h2>Verification Pending</h2>
            <p>
              We've sent a verification link to{' '}
              <span className="email-highlight">{form.email}</span>
            </p>
            <p>Please check your inbox and click the link to verify your account.</p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/login" className="btn btn-primary btn-block">
                Go to Login
              </Link>
              <button
                className="btn btn-ghost btn-block"
                onClick={() => setRegistered(false)}
              >
                Register another account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ──
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="glass-card auth-card">
          <div className="auth-header">
            <div className="logo-icon">
              <Home size={26} color="white" />
            </div>
            <h1>Create Account</h1>
            <p>Join StayEase and start your journey</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <span className="form-error">{fieldErrors.name || ''}</span>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <span className="form-error">{fieldErrors.email || ''}</span>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <div className="input-wrapper">
                <Phone size={16} className="input-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className={`form-input ${fieldErrors.phone ? 'error' : ''}`}
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
              <span className="form-error">{fieldErrors.phone || ''}</span>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
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
              {form.password && (
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

              {/* Requirements Checklist */}
              <ul className="password-requirements">
                {[
                  { key: 'length', label: 'At least 8 characters' },
                  { key: 'upper', label: 'One uppercase letter (A-Z)' },
                  { key: 'lower', label: 'One lowercase letter (a-z)' },
                  { key: 'number', label: 'One number (0-9)' },
                  { key: 'special', label: 'One special character (!@#$...)' },
                ].map(({ key, label }) => (
                  <li key={key} className={passwordChecks[key] ? 'met' : ''}>
                    {passwordChecks[key] ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
