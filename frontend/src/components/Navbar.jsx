import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import only the icons we actually use in the component
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  // Get authentication state and logout action from our custom hook
  const { user, isAuthenticated, logout } = useAuth();
  
  // useLocation lets us know the current page URL path (e.g. "/" or "/jobs")
  const location = useLocation();

  // --- STATE DEFINITIONS ---
  // Tracks if the mobile dropdown navigation panel is open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Tracks if the desktop user profile dropdown list is open
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Ref for dropdown container to detect outside clicks
  const dropdownRef = useRef(null);

  // --- CLOSE DROPDOWN ON OUTSIDE CLICK ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // --- CLOSE MOBILE MENU ON ROUTE CHANGE ---
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // --- HELPER FUNCTIONS ---
  // Toggles the mobile menu open/closed state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggles the user profile settings menu dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Closes all menus when clicking navigation links or logging out
  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // Helper to apply 'active' styling to the current page link
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Log user out of the dashboard and close all settings menus
  const handleLogout = () => {
    closeMenus();
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        
        {/* Brand Logo Link */}
        <Link to="/" className="nav-logo" onClick={closeMenus}>
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">Smart<span className="logo-accent">Sarkari</span></span>
        </Link>

        {/* --- NAVIGATION LINKS --- */}
        {/* On mobile screens, the CSS class 'show' displays the links as a vertical list */}
        <div className={`nav-links ${isMobileMenuOpen ? 'show' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenus}>Home</Link>
          <Link to="/jobs" className={`nav-link ${isActive('/jobs')}`} onClick={closeMenus}>Jobs</Link>
          
          {/* Only show "For You" link to authenticated users */}
          {isAuthenticated && (
            <Link to="/recommendations" className={`nav-link ${isActive('/recommendations')}`} onClick={closeMenus}>For You</Link>
          )}
          
          {/* Only show "Dashboard" link to logged-in admin users */}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={closeMenus}>Dashboard</Link>
          )}
        </div>

        {/* --- USER PROFILE ACTIONS --- */}
        <div className="nav-actions">
          {!isAuthenticated ? (
            // Shown when NOT logged in: Login and Register buttons
            <div id="authButtons">
              <Link to="/login" className="btn btn-outline btn-sm" style={{ marginRight: '8px' }} onClick={closeMenus}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenus}>Register</Link>
            </div>
          ) : (
            // Shown when logged in: Avatar circular card with expandable settings menu
            <div style={{ position: 'relative' }} ref={dropdownRef}>
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

          {/* Mobile hamburger toggle button */}
          <button className="nav-toggle" onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', padding: '6px' }}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
