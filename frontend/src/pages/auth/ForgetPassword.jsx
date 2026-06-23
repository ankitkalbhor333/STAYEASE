import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordapi } from "../../api/auth.api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await forgotPasswordapi({ email });
      setMessage(res.data.msg || "If your email exists, you will receive reset instructions.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to send reset link. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <h1>Forgot Password</h1>
      <form onSubmit={submit} className="auth-form">
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
}
