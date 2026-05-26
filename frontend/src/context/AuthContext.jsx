import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Context to share user authentication details across components
const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '';

// Custom hook so components can easily consume the Context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // --- STATE DEFINITIONS ---
  const [user, setUser] = useState(null); // Holds details of the logged-in user
  const [token, setToken] = useState(localStorage.getItem('token') || ''); // Holds JWT authentication token
  const [isLoading, setIsLoading] = useState(true); // Loading flag while fetching user details
  const [toasts, setToasts] = useState([]); // List of active banner notifications

  // Dynamically compute isAuthenticated (true if user is loaded, false if null)
  const isAuthenticated = !!user;

  // --- TOAST NOTIFICATIONS SYSTEM ---
  // Show a toast that disappears automatically after 4 seconds
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Close toast when clicked manually
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- LOAD USER SESSION ---
  // Automatically loads user profile on startup if a token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        } else {
          // Clear session if token is invalid
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // --- AUTH ACTIONS (REGISTER, LOGIN, LOGOUT) ---
  
  // Register a new user
  const register = async (name, email, password, phone) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Registration successful! Welcome.', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error during registration', 'error');
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Login an existing user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Welcome back! Login successful.', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Invalid credentials', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error during login', 'error');
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout current user session
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  // Update user state after editing profile details
  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout,
        updateProfileState,
        showToast,
        toasts,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
