import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../api/auth.api";
import { getProfileAPI } from "../../api/user.api";
import useAuth from "../../hooks/useAuth";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);
    setLoading(true);

    try {
      const res = await loginUser({ email: loginEmail, password: loginPassword });
      localStorage.setItem("token", res.data.token);

      const profile = await getProfileAPI();
      setUser(profile.data.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);
    setLoading(true);

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });

      // Clear register inputs
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");

      // Redirect to verification notice page
      onClose();
      navigate(`/verify-email-notice?email=${encodeURIComponent(regEmail)}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Registration failed. Please check details.");
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden mx-4 z-10 animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        {/* Top brand header bar */}
        <div className="h-1.5 bg-[#B40032]" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Modal Content Scrollable Area */}
        <div className="p-8 md:p-10 overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-[#B40032] font-black text-3xl tracking-widest block mb-2 select-none">
              LUXE
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {mode === "login" ? "Welcome Back 👋" : "Join LUXE"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {mode === "login" 
                ? "Sign in to access your luxury stays and bookings." 
                : "Create an account to explore premium curated experiences."
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium">
              <div className="flex gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  {validationErrors.length > 0 && (
                    <ul className="list-disc list-inside mt-2 text-xs font-normal space-y-1">
                      {validationErrors.map((errText, idx) => (
                        <li key={idx}>{errText}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B40032] focus:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <span
                    onClick={() => {
                      onClose();
                      navigate("/forgot-password");
                    }}
                    className="text-xs font-medium text-[#B40032] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B40032] focus:bg-white transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-base shadow-md transition-all duration-200 mt-2 flex items-center justify-center gap-2 ${
                  loading 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-[#B40032] hover:bg-[#900028] hover:shadow-lg active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B40032] focus:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B40032] focus:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B40032] focus:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Must be strong"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B40032] focus:bg-white transition-all duration-200"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Must be at least 8 characters, containing uppercase, lowercase, numbers, and symbols.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-white text-base shadow-md transition-all duration-200 mt-3 flex items-center justify-center gap-2 ${
                  loading 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-[#B40032] hover:bg-[#900028] hover:shadow-lg active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* Toggle View Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
            <span className="text-slate-500">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            <button
              onClick={() => {
                setError("");
                setValidationErrors([]);
                setMode(mode === "login" ? "register" : "login");
              }}
              className="font-bold text-[#B40032] hover:underline transition-all duration-200"
            >
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
