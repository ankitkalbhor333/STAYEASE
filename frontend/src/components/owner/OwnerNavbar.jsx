import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function OwnerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-[65px] flex items-center px-4 md:px-8 justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-[#B40032] font-black text-2xl tracking-tight">StayEase</span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#B40032] border border-red-100">
            Hosting
          </span>
        </Link>
      </div>

      {/* Center status message / switch */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-100 rounded-full p-1 border border-slate-200">
        <button
          onClick={() => navigate("/owner")}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-800 shadow-sm"
        >
          Host Dashboard
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
        >
          Switch to Traveling
        </button>
      </div>

      {/* User Actions / Profile */}
      <div className="flex items-center gap-4">
        {/* Switch to traveling for mobile */}
        <button
          onClick={() => navigate("/")}
          className="md:hidden text-xs font-semibold text-[#B40032] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition"
        >
          Traveling Mode
        </button>

        <div className="flex items-center gap-3 border border-slate-200 rounded-full py-1.5 pl-3 pr-1.5 hover:shadow-md transition cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-semibold text-slate-800">
              {user?.name || "Host"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {user?.email}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B40032] to-rose-400 text-white flex items-center justify-center font-bold text-sm shadow-inner uppercase">
            {user?.name?.[0] || "H"}
          </div>
        </div>
      </div>
    </header>
  );
}
