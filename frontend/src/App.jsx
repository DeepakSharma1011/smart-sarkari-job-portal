import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import all UI layout and page components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import RecommendedJobs from './pages/RecommendedJobs';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// --- PROTECTED ROUTE GUARD ---
// Blocks users who are not logged in. If they try to access a protected page, it redirects them to '/login'
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If we are still checking if the user has a valid login token, show a loading spinner
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface-alt)' }}>
        <div className="btn" style={{ background: 'none', border: 'none' }}>
          <span className="spinner" style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: 'var(--primary-light)', width: '32px', height: '32px' }}></span>
        </div>
      </div>
    );
  }

  // If logged in, show the page (children). If not, redirect to Login page
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// --- ADMIN ROUTE GUARD ---
// Blocks non-admin users. If they try to access the dashboard, they are redirected to Home ('/')
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface-alt)' }}>
        <div className="btn" style={{ background: 'none', border: 'none' }}>
          <span className="spinner" style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: 'var(--primary-light)', width: '32px', height: '32px' }}></span>
        </div>
      </div>
    );
  }

  // Show page only if logged in AND role is 'admin'. Otherwise, redirect to Home
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

// --- GUEST-ONLY ROUTE GUARD ---
// Redirects already-authenticated users away from login/register pages
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface-alt)' }}>
        <div className="btn" style={{ background: 'none', border: 'none' }}>
          <span className="spinner" style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: 'var(--primary-light)', width: '32px', height: '32px' }}></span>
        </div>
      </div>
    );
  }

  // If already logged in, redirect to home
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// --- TOAST ALERTS OVERLAY ---
// Renders active floating notifications (success green / error red popups) at the top of the screen
const ToastOverlay = () => {
  const { toasts, removeToast } = useAuth();
  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          style={{ cursor: 'pointer' }}
        >
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <div>{toast.message}</div>
        </div>
      ))}
    </div>
  );
};

// --- MAIN PORTAL LAYOUT ---
const AppContent = () => {
  return (
    <>
      <Navbar /> {/* Global navigation bar */}
      <ToastOverlay /> {/* Toast popups */}
      
      {/* Route Switchboard: Determines which page component is rendered based on the current URL path */}
      <main id="app" style={{ minHeight: 'calc(100vh - 232px)' }}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } />
          
          {/* Protected Pages (require user login) */}
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <RecommendedJobs />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Pages (require admin login role) */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Fallback Route: If URL doesn't match any path, redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Footer /> {/* Global footer section */}
    </>
  );
};

// --- ROOT COMPONENT ---
// Wraps everything with Context providers (AuthProvider) and the Page Router (Router)
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
