import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate(); // Navigation hook to redirect pages
  
  // --- STATE DEFINITIONS ---
  const [name, setName] = useState(''); // Stores name input value
  const [email, setEmail] = useState(''); // Stores email input value
  const [phone, setPhone] = useState(''); // Stores phone input value
  const [password, setPassword] = useState(''); // Stores password input value
  const [confirmPassword, setConfirmPassword] = useState(''); // Stores confirmPassword input value
  const [error, setError] = useState(''); // Stores error alerts

  // --- REGISTRATION SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic validation checks
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // 2. Validate Indian phone number (10-digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    // 3. Call register function from AuthContext
    const res = await register(name, email, password, phone);
    
    // Redirect to profile setup on success, otherwise display API error
    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="container register-page">
      <div className="card card-glass animate-fade-in register-card">
        
        {/* Title Section */}
        <div className="register-header">
          <h2 className="register-title">Create Account</h2>
          <p className="text-muted">Register to get personalized government job matching</p>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="badge badge-danger register-error-badge">
            ⚠️ {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          
          {/* 1. Name Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input 
              type="text" 
              id="name" 
              className="form-input" 
              placeholder="Your full name" 
              value={name} 
              onChange={(e) => { setName(e.target.value); setError(''); }} 
              required 
            />
          </div>

          {/* 2. Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
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

          {/* 3. Phone Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number *</label>
            <input 
              type="tel" 
              id="phone" 
              className="form-input" 
              placeholder="10-digit Indian phone number" 
              value={phone} 
              onChange={(e) => { setPhone(e.target.value); setError(''); }} 
              required 
            />
          </div>

          {/* 4. Password Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="At least 6 characters" 
              value={password} 
              onChange={(e) => { setPassword(e.target.value); setError(''); }} 
              required 
            />
          </div>

          {/* 5. Confirm Password Input */}
          <div className="form-group register-password-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
            <input 
              type="password" 
              id="confirmPassword" 
              className="form-input" 
              placeholder="Confirm your password" 
              value={confirmPassword} 
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary register-btn" 
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner" /> : 'Register & Set Up Profile'}
          </button>
        </form>

        {/* Redirect to Login */}
        <div className="register-footer">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="register-link">Login here</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
