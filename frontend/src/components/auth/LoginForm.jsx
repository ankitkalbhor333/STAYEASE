import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth.api";
import { getProfileAPI } from "../../api/user.api";
import useAuth from "../../hooks/useAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
     console.log("Login request: ", { email });
      const res = await loginUser({ email, password });
      console.log("Login response:", res);

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);

        const profile = await getProfileAPI();
        setUser(profile.data.user);

        navigate("/profile");
      } else {
        console.warn("Login response missing token", res);
        setError("Login failed: no token returned.");
      }
    } catch (err) {
      // Enhanced error logging for debugging network / CORS / server issues
      console.error("Login error (full):", err);
      try {
        // Axios error details
        const details = {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          data: err.response?.data,
        };
        console.error("Login error (details):", details);
        setError(err.response?.data?.msg || `Login failed: ${err.message}`);
      } catch (inner) {
        console.error("Error reading axios error:", inner);
        setError("Login failed. See console for details.");
      }
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      {error && <p className="form-error">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
