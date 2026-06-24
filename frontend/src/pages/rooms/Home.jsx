import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthModal from "../../components/auth/AuthModal";
import Navbar from "../../components/home/Navbar";
import HeroSection from "../../components/home/HeroSection";
import CategorySelector from "../../components/home/CategorySelector";
import FeaturedStays from "../../components/home/FeaturedStays";
import Footer from "../../components/home/Footer";
import { searchRoomsAPI } from "../../api/room.api";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  // Search state
  const [searchWhere, setSearchWhere] = useState("");
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [searchWho, setSearchWho] = useState("");
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredError, setFeaturedError] = useState(null);

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

  const openAuth = (mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchWhere) query.set("city", searchWhere);
    if (searchCheckIn) query.set("checkIn", searchCheckIn);
    if (searchCheckOut) query.set("checkOut", searchCheckOut);
    if (searchWho) query.set("guests", searchWho);
    navigate(`/rooms/search?${query.toString()}`);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCategorySelect = (categoryId, categoryLabel) => {
    setActiveCategory(categoryId);
    navigate(`/rooms/search?city=${encodeURIComponent(categoryLabel)}`);
  };

  const handleSearchFieldChange = (field, value) => {
    switch (field) {
      case "searchWhere":
        setSearchWhere(value);
        break;
      case "searchCheckIn":
        setSearchCheckIn(value);
        break;
      case "searchCheckOut":
        setSearchCheckOut(value);
        break;
      case "searchWho":
        setSearchWho(value);
        break;
      default:
        break;
    }
  };

  const fetchFeaturedRooms = async () => {
    try {
      setFeaturedLoading(true);
      setFeaturedError(null);
      const res = await searchRoomsAPI({ page: 1, limit: 4 });
      setFeaturedRooms(res.data.data || []);
    } catch (err) {
      setFeaturedError(err.message || "Unable to load featured stays");
      setFeaturedRooms([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const avatarUrl = user?.profileImage
    ? `http://localhost:5000/uploads/${user.profileImage}`
    : null;

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-between">
      
      <Navbar user={user} onOpenAuth={openAuth} onLogout={handleLogout} />
      <HeroSection
        searchWhere={searchWhere}
        searchCheckIn={searchCheckIn}
        searchCheckOut={searchCheckOut}
        searchWho={searchWho}
        onSearchChange={handleSearchFieldChange}
        onSearchSubmit={handleSearch}
      />
      <CategorySelector
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
      />

      <FeaturedStays
        rooms={featuredRooms}
        loading={featuredLoading}
        error={featuredError}
        onViewAll={() => navigate("/rooms/search")}
      />

      <Footer />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

    </div>
  );
}
