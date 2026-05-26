import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  // Grab login logic and loading state from context
  const { login, isLoading } = useAuth();
  const navigate = useNavigate(); // Hook for page redirection
  
  // --- STATE DEFINITIONS ---
  const [form, setForm] = useState({ 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState(''); // Stores validation/API errors to show user

  // --- INPUT CHANGES HANDLER ---
  const handleChange = (e) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });
    // Clear any previous error message when typing
    if (error) {
      setError('');
    }
  };

  // --- FORM SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if fields are empty
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Execute login request
    const res = await login(form.email, form.password);
    
    // Redirect on success, otherwise display error message
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 50 }}>
      <div className="card card-glass animate-fade-in" style={{ width: '100%', maxWidth: 420, padding: 35 }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Welcome Back</h2>
          <p className="text-muted">Login to find government jobs matching your profile</p>
        </div>

        {/* Error Notification Badge */}
        {error && (
          <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: 10, textAlign: 'center', marginBottom: 20, fontSize: '.85rem' }}>
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
              name="email" 
              className="form-input" 
              placeholder="name@email.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 30 }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={form.password} 
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
            {isLoading ? <span className="spinner" /> : 'Login to My Portal'}
          </button>
        </form>

        {/* Sign up link */}
        <div style={{ marginTop: 25, textAlign: 'center', fontSize: '.9rem' }}>
          <span className="text-muted">New to SmartSarkari? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
