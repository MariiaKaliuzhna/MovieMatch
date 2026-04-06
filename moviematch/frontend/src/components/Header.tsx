import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gameModeIcon from '../assets/game-mode-icon.png';
import catalogIcon from '../assets/catalog-icon.png';
import userIcon from '../assets/user-icon.png';

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
        <Link to="/game" className="nav-icon-btn" title="Game mode">
          <img src = {gameModeIcon} alt= 'Game mode' />
        </Link>
        <Link to="/catalog" className="nav-icon-btn" title="Catalog">
          <img src = {catalogIcon} alt= 'Catalog' />
        </Link>
        <div className="user-menu-wrapper" ref={ref}>
          <button
            className="nav-icon-btn"
            title="Profile"
            onClick={() => isLoggedIn ? setOpen(o => !o) : navigate('/login')}
          >
            <img src = {userIcon} alt= 'User' />
          </button>

          {open && isLoggedIn && (
            <div className="user-dropdown">
              <Link to="/favorites" onClick={() => setOpen(false)}>Favorites</Link>
              <Link to="/watchlist" onClick={() => setOpen(false)}>Watchlist</Link>
              <Link to="/history" onClick={() => setOpen(false)}>History of ratings</Link>
              <hr />
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
