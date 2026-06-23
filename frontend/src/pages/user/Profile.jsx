import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { uploadProfileImage } from "../../api/user.api";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-slate-100">
          <p className="text-slate-600 mb-6 font-medium">Please log in to view your profile.</p>
          <Link to="/" className="inline-block w-full py-3 bg-[#B40032] text-white font-bold rounded-xl hover:bg-[#900028] transition-colors shadow-md">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get Initials for Avatar placeholder
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const res = await uploadProfileImage(formData);
      // Backend returns: data: { profileImage: ..., user: ... }
      const updatedUser = res.data.data.user || res.data.data;
      setUser(updatedUser);
      setSuccess("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarUrl = user.profileImage
    ? `http://localhost:5000/uploads/${user.profileImage}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-5 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-[#B40032] font-black text-2xl tracking-wider select-none">
          LUXE
        </Link>
        <button 
          onClick={handleLogout}
          className="text-sm font-semibold text-slate-500 hover:text-[#B40032] transition-colors px-4 py-2 rounded-xl hover:bg-slate-50"
        >
          Logout
        </button>
      </header>

      {/* Profile Card */}
      <main className="flex-grow flex items-center justify-center p-6 my-8">
        <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
          
          {/* Cover Accent */}
          <div className="h-32 bg-gradient-to-r from-[#B40032] to-[#7a0022] relative" />

          {/* User Info Section */}
          <div className="px-8 pb-10 pt-0 relative flex flex-col items-center">
            
            {/* Avatar / Upload Container */}
            <div className="relative -mt-20 mb-6 group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg flex items-center justify-center text-slate-700 font-extrabold text-4xl select-none">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#B40032]">{getInitials(user.name)}</span>
                )}
              </div>
              
              {/* Image upload hover overlay */}
              <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-white text-xs font-semibold">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  disabled={uploading}
                />
              </label>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center">
              {user.name}
            </h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider mt-2 select-none">
              {user.role || "MEMBER"}
            </span>

            {/* Success / Error Alerts */}
            {success && (
              <div className="w-full mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium text-center">
                {success}
              </div>
            )}
            {error && (
              <div className="w-full mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Profile Fields */}
            <div className="w-full mt-8 border-t border-slate-100 pt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </span>
                  <span className="text-slate-800 font-medium break-all">
                    {user.email}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </span>
                  <span className="text-slate-800 font-medium">
                    {user.phone || <span className="text-slate-400 italic">Not set</span>}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Account Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-800 font-medium">
                    {user.isVerified ? (
                      <>
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        <span>Verified Account</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <span>Pending Verification</span>
                      </>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Member Since
                  </span>
                  <span className="text-slate-800 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "June 2026"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full mt-10 flex gap-4 flex-col sm:flex-row">
              <button
                onClick={() => navigate("/edit-profile")}
                className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-[#B40032] hover:bg-[#900028] text-white text-base shadow-md hover:shadow-lg transition-all duration-200 text-center active:scale-[0.98]"
              >
                Edit Profile
              </button>
              <Link
                to="/"
                className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-base border border-slate-200 transition-all duration-200 text-center active:scale-[0.98]"
              >
                Explore Stays
              </Link>
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
