import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPasswordapi } from "../../api/auth.api";
import useAuth from "../../hooks/useAuth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { setUser } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await resetPasswordapi(token, { newPassword: password });
      const jwtToken = res.data.token;
      if (jwtToken) {
        localStorage.setItem("token", jwtToken);
      }
      if (res.data.user) {
        setUser(res.data.user);
      }

      localStorage.setItem("token", jwtToken);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to reset password. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <h1>Reset Password</h1>
      <form onSubmit={submit} className="auth-form">
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
