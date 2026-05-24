import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, User, Award, Calendar, LayoutDashboard, LogOut, BookOpen, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    closeMenus();
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenus}>
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">Smart<span className="logo-accent">Sarkari</span></span>
        </Link>

        {/* Desktop Links */}
        <div className={`nav-links ${isMobileMenuOpen ? 'show' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenus}>Home</Link>
          <Link to="/jobs" className={`nav-link ${isActive('/jobs')}`} onClick={closeMenus}>Jobs</Link>
          {isAuthenticated && (
            <Link to="/recommendations" className={`nav-link ${isActive('/recommendations')}`} onClick={closeMenus}>For You</Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={closeMenus}>Dashboard</Link>
          )}
        </div>

        <div className="nav-actions">
          {!isAuthenticated ? (
            <div id="authButtons">
              <Link to="/login" className="btn btn-outline btn-sm" style={{ marginRight: '8px' }} onClick={closeMenus}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenus}>Register</Link>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div className="user-avatar" onClick={toggleDropdown}>
                <span>{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              </div>
              
              {isDropdownOpen && (
                <div className="user-dropdown show">
                  <div className="dropdown-header">
                    <span style={{ fontWeight: 600 }}>{user?.name}</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>{user?.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={closeMenus}>
                    👤 My Profile
                  </Link>
                  <Link to="/recommendations" className="dropdown-item" onClick={closeMenus}>
                    🎯 Recommendations
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="nav-toggle" onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', padding: '6px' }}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
