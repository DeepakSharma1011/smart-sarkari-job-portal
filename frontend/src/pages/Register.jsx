import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate(); // Navigation hook to redirect pages
  
  // --- STATE DEFINITIONS ---
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');

  // --- INPUT CHANGE HANDLER ---
  const handleChange = (e) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });
    // Clear error message when user starts typing again
    if (error) {
      setError('');
    }
  };

  // --- REGISTRATION SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = form;

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
    <div className="container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 50 }}>
      <div className="card card-glass animate-fade-in" style={{ width: '100%', maxWidth: 480, padding: 35 }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Create Account</h2>
          <p className="text-muted">Register to get personalized government job matching</p>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: 10, textAlign: 'center', marginBottom: 20, fontSize: '.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Explicit Form Fields */}
        <form onSubmit={handleSubmit}>
          
          {/* 1. Name Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="form-input" 
              placeholder="Your full name" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* 2. Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="form-input" 
              placeholder="name@email.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* 3. Phone Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number *</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              className="form-input" 
              placeholder="10-digit Indian phone number" 
              value={form.phone} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* 4. Password Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form-input" 
              placeholder="At least 6 characters" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* 5. Confirm Password Input */}
          <div className="form-group" style={{ marginBottom: 30 }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              className="form-input" 
              placeholder="Confirm your password" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: 14 }} 
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner" /> : 'Register & Set Up Profile'}
          </button>
        </form>

        {/* Redirect to Login */}
        <div style={{ marginTop: 25, textAlign: 'center', fontSize: '.9rem' }}>
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
