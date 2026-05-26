import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Brand Info Column */}
          <div className="footer-brand">
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">Smart<span className="logo-accent">Sarkari</span></span>
            <p className="footer-desc">
              Helping students find the right government jobs based on their profile. No more missing deadlines or confusion.
            </p>
          </div>
          
          {/* Column 1: Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/register">Register</Link>
          </div>
          
          {/* Column 2: Specific Categories */}
          <div className="footer-col">
            <h4>Job Fields</h4>
            <Link to="/jobs?field=SSC">SSC</Link>
            <Link to="/jobs?field=UPSC">UPSC</Link>
            <Link to="/jobs?field=Railway">Railway</Link>
            <Link to="/jobs?field=Banking">Banking</Link>
            <Link to="/jobs?field=IT & CS">IT & CS</Link>
          </div>
          
        </div>
        
        {/* Footer Bottom copyright banner */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartSarkari. All rights reserved.</p>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
