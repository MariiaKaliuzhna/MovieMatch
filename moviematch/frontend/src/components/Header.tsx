import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21h6M12 3a6 6 0 0 1 4.24 10.24C15.5 14 15 15 15 16H9c0-1-.5-2-1.24-2.76A6 6 0 0 1 12 3z"/>
    <line x1="9" y1="21" x2="15" y2="21"/>
  </svg>
);

const EyeSearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="4"/>
    <path d="M2 11s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/>
    <line x1="18" y1="18" x2="21" y2="21"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); setOpen(false); };

  return (
    <header className="header">
      <Link to={isLoggedIn ? '/game' : '/login'} className="header-logo">
        <div className="logo-circle">MM</div>
        <span className="header-title">MovieMatch</span>
      </Link>

      <nav className="header-nav">
        <Link to="/game" className="nav-icon-btn" title="Game mode"><BulbIcon /></Link>
        <Link to="/catalog" className="nav-icon-btn" title="Catalog"><EyeSearchIcon /></Link>

        <div className="user-menu-wrapper" ref={ref}>
          <button
            className="nav-icon-btn"
            title="Profile"
            onClick={() => isLoggedIn ? setOpen(o => !o) : navigate('/login')}
          >
            <UserIcon />
          </button>

          {open && isLoggedIn && (
            <div className="user-dropdown">
              <Link to="/favorites" onClick={() => setOpen(false)}>⭐ Favorites</Link>
              <Link to="/watchlist" onClick={() => setOpen(false)}>🎬 Watchlist</Link>
              <Link to="/history" onClick={() => setOpen(false)}>📋 History of ratings</Link>
              <hr />
              <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
