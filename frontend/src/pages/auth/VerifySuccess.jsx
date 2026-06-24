import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getProfileAPI } from "../../api/user.api";

export default function VerifySuccess() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [message, setMessage] = useState("Finalizing verification...");

  useEffect(() => {
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("Verification token missing.");
        return;
      }

      try {
        localStorage.setItem("token", token);

        // fetch profile and set user in context
        const res = await getProfileAPI();
        setUser(res.data.data);

        setMessage("Email verified and logged in! Redirecting...");
        setTimeout(() => navigate("/"), 1200);
      } catch (err) {
        console.error("VerifySuccess error:", err);
        setMessage("Verification succeeded but auto-login failed. Please login manually.");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    finish();
  }, [navigate, setUser]);

  return (
    <div style={{display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{padding: 24, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)'}}>
        <h2>Verification</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
