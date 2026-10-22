import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Shield, LogIn, LogOut, Clapperboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand">
        <Film size={26} color="#e50914" />
        <span>Cine<span style={{ color: '#e50914' }}>Scope</span></span>
        <span className="brand-badge">PRO</span>
      </Link>

      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Clapperboard size={18} />
          <span>Discover</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Shield size={18} />
            <span>Admin</span>
          </NavLink>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
              }}
            >
              {user.name} {isAdmin && '⭐'}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '7px 14px' }}>
            <LogIn size={16} />
            <span>Admin Login</span>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
