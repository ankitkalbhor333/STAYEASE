import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthModal from "../../components/auth/AuthModal";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Search state
  const [searchWhere, setSearchWhere] = useState("");
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [searchWho, setSearchWho] = useState("");

  // Categories list
  const categories = [
    { id: "cabins", label: "Cabins", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "beachfront", label: "Beachfront", icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zm0 0h9m-9 0H3m12 0v5m0-5h6v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" },
    { id: "pools", label: "Amazing Pools", icon: "M8 7v12m8-12v12M2 9h20M2 15h20" },
    { id: "mansions", label: "Mansions", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { id: "trending", label: "Trending", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" },
    { id: "treehouses", label: "Treehouses", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" },
    { id: "lakefront", label: "Lakefront", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
    { id: "design", label: "Design", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }
  ];

  const [activeCategory, setActiveCategory] = useState("cabins");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openAuth = (mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching stays:", { searchWhere, searchCheckIn, searchCheckOut, searchWho });
    alert(`Searching for properties in "${searchWhere || "anywhere"}"...`);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const avatarUrl = user?.profileImage
    ? `http://localhost:5000/uploads/${user.profileImage}`
    : null;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-between">
      
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-[#B40032]" />

      {/* Main Header / Navigation */}
      <header className="border-b border-slate-100 py-4 px-6 md:px-12 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          
          {/* Logo */}
          <Link to="/" className="text-[#B40032] font-black text-3xl tracking-wider select-none flex-shrink-0">
            LUXE
          </Link>

          {/* Center Tabs - Airbnb Style */}
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

          {/* Right Action Icons & Profile Dropdown */}
          <div className="flex items-center gap-4 relative">
            <span className="text-sm font-semibold text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 hidden lg:inline-block">
              Become a host
            </span>
            
            {/* Globe Icon */}
            <button className="p-2.5 rounded-full hover:bg-slate-50 text-slate-600 transition-all duration-200 hidden sm:inline-block">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
            </button>

            {/* Profile Dropdown Capsule Button */}
            <div ref={dropdownRef} className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 border border-slate-200 hover:shadow-md px-3.5 py-1.5 rounded-full bg-white transition-all duration-200 cursor-pointer"
              >
                {/* Hamburger Icon */}
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>

                {/* Avatar */}
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

              {/* Profile Dropdown Menu */}
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
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold"
                      >
                        My Profile
                      </Link>
                      <Link 
                        to="/edit-profile" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Edit Profile
                      </Link>
                      <hr className="border-slate-100 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left block px-5 py-2.5 text-sm text-[#B40032] hover:bg-slate-50 font-bold"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => openAuth("register")}
                        className="w-full text-left block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-bold"
                      >
                        Sign Up
                      </button>
                      <button 
                        onClick={() => openAuth("login")}
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

      {/* Hero Section */}
      <section className="relative h-[560px] flex items-center justify-center px-6 md:px-12 py-16 overflow-hidden">
        {/* Background Unsplash image with luxury vibe */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=85" 
            alt="Luxury Villa background" 
            className="w-full h-full object-cover scale-[1.02]"
          />
          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-slate-900/60" />
        </div>

        <div className="max-w-5xl w-full mx-auto relative z-10 flex flex-col items-center text-center text-white">
          <span className="px-4 py-1.5 bg-[#B40032] text-xs font-bold uppercase tracking-widest rounded-full mb-6 shadow-lg shadow-black/20">
            Premium Lodgings
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl mb-8 drop-shadow-md">
            Extraordinary stays.<br />Effortless discovery.
          </h1>

          {/* Capsule Search Bar Form (Airbnb Style) */}
          <form 
            onSubmit={handleSearch}
            className="w-full max-w-4xl bg-white border border-slate-100 rounded-full shadow-2xl p-2.5 grid grid-cols-1 md:grid-cols-4 items-center gap-1 text-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-100"
          >
            {/* Where field */}
            <div className="px-6 py-2.5 text-left flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#B40032]">Where</label>
              <input 
                type="text" 
                placeholder="Search destinations" 
                value={searchWhere}
                onChange={(e) => setSearchWhere(e.target.value)}
                className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
              />
            </div>

            {/* Check In field */}
            <div className="px-6 py-2.5 text-left flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Check in</label>
              <input 
                type="date" 
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
              />
            </div>

            {/* Check Out field */}
            <div className="px-6 py-2.5 text-left flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Check out</label>
              <input 
                type="date" 
                value={searchCheckOut}
                onChange={(e) => setSearchCheckOut(e.target.value)}
                className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
              />
            </div>

            {/* Who field + Search Circle Button */}
            <div className="px-6 py-2.5 text-left flex justify-between items-center gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Who</label>
                <input 
                  type="text" 
                  placeholder="Add guests" 
                  value={searchWho}
                  onChange={(e) => setSearchWho(e.target.value)}
                  className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
                />
              </div>
              
              {/* Search button */}
              <button 
                type="submit"
                className="w-12 h-12 bg-[#B40032] hover:bg-[#900028] hover:scale-105 active:scale-95 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-lg shadow-[#B40032]/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* Category Icons Selector */}
      <section className="border-b border-slate-100 py-6 px-6 md:px-12 bg-white sticky top-[80px] z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center overflow-x-auto gap-10 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-2.5 border-b-2 pb-3.5 px-1.5 transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isActive 
                    ? "border-[#B40032] text-[#B40032] font-bold" 
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={cat.icon}></path>
                </svg>
                <span className="text-xs tracking-wide">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Stays Content (Placeholder/Demo Grid) */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex-grow w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Explore Popular Stays
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Top-rated rentals with premium amenities, handpicked for you.
            </p>
          </div>
          <button className="text-sm font-bold text-[#B40032] hover:underline cursor-pointer">
            View all stays
          </button>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[
            { id: 1, title: "Modernist Lakefront Cabin", location: "Lake Tahoe, California", price: "$340", rating: "4.95", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" },
            { id: 2, title: "Cliffside Pool Oasis", location: "Santorini, Greece", price: "$510", rating: "4.98", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
            { id: 3, title: "A-Frame Redwoods Retreat", location: "Guerneville, California", price: "$220", rating: "4.88", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80" },
            { id: 4, title: "Architectural Desert Villa", location: "Joshua Tree, California", price: "$420", rating: "4.92", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80" }
          ].map((stay) => (
            <div key={stay.id} className="group cursor-pointer">
              {/* Card Image */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative mb-4 border border-slate-100 shadow-sm transition-all duration-300 group-hover:shadow-md">
                <img 
                  src={stay.image} 
                  alt={stay.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-800 hover:text-[#B40032] hover:scale-105 active:scale-95 transition-all shadow-sm">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </button>
              </div>

              {/* Card Details */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{stay.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase mt-0.5">{stay.location}</p>
                  <p className="text-slate-800 text-sm mt-1.5 font-extrabold">
                    {stay.price} <span className="font-semibold text-slate-400 text-xs">/ night</span>
                  </p>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 text-slate-800 text-xs font-bold">
                  <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span>{stay.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-12 px-6 md:px-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:underline cursor-pointer">Help Center</li>
              <li className="hover:underline cursor-pointer">Safety information</li>
              <li className="hover:underline cursor-pointer">Cancellation options</li>
              <li className="hover:underline cursor-pointer">Our COVID-19 Response</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:underline cursor-pointer">StayEase.org: disaster relief</li>
              <li className="hover:underline cursor-pointer">Support Afghan refugees</li>
              <li className="hover:underline cursor-pointer">Combating discrimination</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">Hosting</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:underline cursor-pointer">Try hosting</li>
              <li className="hover:underline cursor-pointer">AirCover: protection for Hosts</li>
              <li className="hover:underline cursor-pointer">Explore hosting resources</li>
              <li className="hover:underline cursor-pointer">How to host responsibly</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">LUXE</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:underline cursor-pointer">Newsroom</li>
              <li className="hover:underline cursor-pointer">Learn about new features</li>
              <li className="hover:underline cursor-pointer">Letter from our founders</li>
              <li className="hover:underline cursor-pointer">Careers</li>
            </ul>
          </div>
        </div>
        <hr className="border-slate-200 my-8 max-w-7xl mx-auto" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; 2026 LUXE Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>&middot;</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span>&middot;</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

    </div>
  );
}
