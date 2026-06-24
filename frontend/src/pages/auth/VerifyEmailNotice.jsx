import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resendVerificationEmail } from "../../api/auth.api";

export default function VerifyEmailNotice() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your-email@example.com";
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    setResending(true);
    setMessage("");
    setError("");
    try {
      const res = await resendVerificationEmail(email);
      setMessage(res.data.msg || "Verification email has been resent successfully!");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Branded Header */}
      <header className="bg-white border-b border-slate-100 py-5 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-[#B40032] font-black text-2xl tracking-wider select-none">
          LUXE
        </Link>
        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-[#B40032] transition-colors">
          Back to Home
        </Link>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-grow flex items-center justify-center p-6 my-12">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200">
          
          {/* Top Brand Banner Accent */}
          <div className="h-2 bg-gradient-to-r from-[#B40032] to-[#e63946]" />

          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            {/* Verification Envelope Icon */}
            <div className="w-16 h-16 bg-[#B40032]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-8 h-8 text-[#B40032]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"></path>
              </svg>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
              Verify Your Email
            </h1>
            
            <p className="text-slate-600 mb-6 leading-relaxed max-w-sm">
              We've sent a verification link to <span className="font-semibold text-slate-900 break-all">{email}</span>. Please click the link to activate your account.
            </p>

            {/* Alert Messages */}
            {message && (
              <div className="w-full mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{message}</span>
              </div>
            )}
            
            {error && (
              <div className="w-full mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8 text-left">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">
                What's next?
              </h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#B40032] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Check your inbox</p>
                    <p>Open the email sent from <span className="font-medium">ankitkalbhor3@gmail.com</span> with subject <span className="italic font-medium">"Verify Your Email"</span>.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#B40032] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Click verification link</p>
                    <p>Tap the <span className="font-semibold text-[#B40032]">Verify Email Address</span> button inside that message.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#B40032] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Start exploring LUXE</p>
                    <p>You will be redirected back to our app, verified and ready to discover stays!</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Actions */}
            <button
              onClick={handleResend}
              disabled={resending}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                resending 
                  ? "bg-slate-400 cursor-not-allowed" 
                  : "bg-[#B40032] hover:bg-[#900028] hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {resending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Resending link...</span>
                </>
              ) : (
                <span>Resend Verification Email</span>
              )}
            </button>

            {/* Check Spam/Junk Tip Box */}
            <div className="w-full mt-6 flex items-start gap-3 p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-left">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-800">Can't find the email?</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Please check your spam or junk folder, or wait a few minutes before resending. The link is valid for 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400">
        <p>&copy; 2026 LUXE Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
