import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmailapi } from "../../api/auth.api";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyEmailapi(token);
        setMessage(res.data.msg || "Email verified successfully.");
        setTimeout(() => navigate("/login"), 2500);
      } catch (err) {
        setError(err.response?.data?.msg || "Verification failed. Please try again.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <h1>Verify Email</h1>
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
