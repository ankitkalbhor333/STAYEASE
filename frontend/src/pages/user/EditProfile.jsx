import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { updateProfileAPI } from "../../api/user.api";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
    setLoading(false);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await updateProfileAPI({ name, email, phone });
      const updatedUser = res.data.data || { name, email, phone };
      setUser(updatedUser);
      setMessage("Profile updated successfully.");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update profile. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="auth-page">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}

        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Phone
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
