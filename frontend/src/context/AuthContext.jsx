import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a Context object to share authentication state across all components
const AuthContext = createContext();

// Get the backend API URL from environment variables (fallback to empty string if not set)
const API_URL = import.meta.env.VITE_API_URL || '';

// Custom hook to make it easy for other components to access the AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // --- STATE DEFINITIONS ---
  const [user, setUser] = useState(null); // Holds the logged-in user details
  const [token, setToken] = useState(localStorage.getItem('token') || ''); // Holds the JWT auth token
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Quick flag to check if logged in
  const [isLoading, setIsLoading] = useState(true); // Loading state when fetching the current user
  const [toasts, setToasts] = useState([]); // List of active toast notifications

  // --- TOAST ALERTS SYSTEM ---
  // Adds a toast notification that automatically disappears after 4 seconds
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    // Add new toast to the array
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Remove the toast after 4 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 4000);
  };

  // Allows manually closing a toast alert when clicking the 'X' button
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  };

  // --- LOAD USER PROFILE ---
  // When the app starts or the token changes, fetch the user profile from the database
  useEffect(() => {
    const loadUser = async () => {
      // If there is no token, we cannot fetch the user, so stop loading
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user data from the backend using the token for authorization
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // If token is invalid or expired, clear it from localStorage and state
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // --- REGISTER NEW USER ---
  const register = async (name, email, password, phone) => {
    try {
      setIsLoading(true);
      
      // Make a POST request to the backend with registration details
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token to localStorage so the session persists
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
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

  // --- USER LOGIN ---
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      // Make a POST request to the backend with login details
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token to localStorage so the session persists
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
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

  // --- USER LOGOUT ---
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully.', 'info');
  };

  // --- UPDATE PROFILE STATE ---
  // Helper function to update the user object in state after profile edits
  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  // Provide state and functions to all child components
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
