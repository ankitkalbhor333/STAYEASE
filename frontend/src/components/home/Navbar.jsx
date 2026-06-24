import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, onOpenAuth, onLogout }) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarUrl = user?.profileImage
    ? `http://localhost:5000/uploads/${user.profileImage}`
    : null;

  return (
    <header className="border-b border-slate-100 py-4 px-6 md:px-12 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <Link to="/" className="text-[#B40032] font-black text-3xl tracking-wider select-none shrink-0">
          LUXE
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <button className="text-slate-800 font-semibold border-b-2 border-slate-800 pb-1 text-sm tracking-wide">
            Stays
          </button>
          <button className="text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm tracking-wide">
            Experiences
          </button>
          <button className="text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm tracking-wide">
            Online Experiences
          </button>
        </nav>

        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => navigate("/host")}
            className="text-sm font-semibold text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-full transition-all duration-200 hidden lg:inline-block"
          >
            Become a host
          </button>

          <button className="p-2.5 rounded-full hover:bg-slate-50 text-slate-600 transition-all duration-200 hidden sm:inline-block">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 border border-slate-200 hover:shadow-md px-3.5 py-1.5 rounded-full bg-white transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 text-xs font-bold text-slate-600 select-none">
                {user ? (
                  avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#B40032]">{getInitials(user.name)}</span>
                  )
                ) : (
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                )}
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-3.5 w-60 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-2.5 z-50 animate-[fadeIn_0.15s_ease-out]">
                {user ? (
                  <>
                    <div className="px-5 py-3 border-b border-slate-50 mb-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/edit-profile"
                      className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Edit Profile
                    </Link>
                    <hr className="border-slate-100 my-2" />
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left block px-5 py-2.5 text-sm text-[#B40032] hover:bg-slate-50 font-bold"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenAuth("register")}
                      className="w-full text-left block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-bold"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => onOpenAuth("login")}
                      className="w-full text-left block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Log In
                    </button>
                    <hr className="border-slate-100 my-2" />
                    <span className="block px-5 py-2.5 text-sm text-slate-500 hover:bg-slate-50 cursor-pointer font-medium">
                      Become a host
                    </span>
                    <span className="block px-5 py-2.5 text-sm text-slate-500 hover:bg-slate-50 cursor-pointer font-medium">
                      Help Center
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
