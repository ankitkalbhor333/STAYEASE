import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home as HomeIcon,
  Search,
  Shield,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg-orbs">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>

        <div className="hero__content">
          <div className="hero__badge">
            <Sparkles size={14} />
            <span>Find your perfect stay</span>
          </div>

          <h1 className="hero__title">
            Discover Places
            <br />
            <span className="hero__title--gradient">You'll Love</span>
          </h1>

          <p className="hero__subtitle">
            Book unique accommodations around the world. From cozy apartments to
            luxury villas — your next adventure starts here.
          </p>

          <div className="hero__actions">
            {isAuthenticated ? (
              <Link to="/" className="btn btn-primary btn-lg">
                <Search size={18} />
                Explore Stays
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {isAuthenticated && (
            <div className="hero__welcome">
              Welcome back, <strong>{user?.name}</strong> 👋
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features__grid">
          <div className="feature-card glass-card">
            <div className="feature-card__icon">
              <Search size={24} />
            </div>
            <h3>Smart Search</h3>
            <p>Find accommodations by location, price, amenities, and availability.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-card__icon feature-card__icon--purple">
              <Shield size={24} />
            </div>
            <h3>Secure Booking</h3>
            <p>Pay safely with Razorpay. Your transactions are encrypted and protected.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-card__icon feature-card__icon--pink">
              <Star size={24} />
            </div>
            <h3>Trusted Reviews</h3>
            <p>Read honest guest reviews and ratings to make informed decisions.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-card__icon feature-card__icon--emerald">
              <MapPin size={24} />
            </div>
            <h3>Prime Locations</h3>
            <p>Properties in the best neighborhoods with detailed location maps.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
