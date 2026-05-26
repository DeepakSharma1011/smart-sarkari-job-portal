import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  // Grab login action and loading state from AuthContext
  const { login, isLoading } = useAuth();
  const navigate = useNavigate(); // Navigation hook for redirecting
  
  // --- STATE DEFINITIONS ---
  const [email, setEmail] = useState(''); // Stores email input value
  const [password, setPassword] = useState(''); // Stores password input value
  const [error, setError] = useState(''); // Stores validation or API error messages

  // --- FORM SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if fields are empty
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Execute login request in context
    const res = await login(email, password);
    
    // Redirect to home page on success, otherwise display error
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="container login-page">
      <div className="card card-glass animate-fade-in login-card">
        
        {/* Title */}
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="text-muted">Login to find government jobs matching your profile</p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="badge badge-danger login-error-badge">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="name@email.com" 
              value={email} 
              onChange={(e) => { setEmail(e.target.value); setError(''); }} 
              required 
            />
          </div>
          
          <div className="form-group login-password-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => { setPassword(e.target.value); setError(''); }} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary login-btn" 
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner" /> : 'Login to My Portal'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="login-footer">
          <span className="text-muted">New to SmartSarkari? </span>
          <Link to="/register" className="login-link">Create an account</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
