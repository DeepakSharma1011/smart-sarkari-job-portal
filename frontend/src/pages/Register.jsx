import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FIELDS = [
  { name: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your name' },
  { name: 'email', label: 'Email Address *', type: 'email', placeholder: 'name@email.com' },
  { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '10-digit Indian phone number' },
  { name: 'password', label: 'Password *', type: 'password', placeholder: 'At least 6 characters' },
  { name: 'confirmPassword', label: 'Confirm Password *', type: 'password', placeholder: 'Confirm password' },
];

const Register = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = form;

    if (!name || !email || !phone || !password) return setError('Please fill in all required fields');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Please enter a valid 10-digit Indian phone number');

    const res = await register(name, email, password, phone);
    res.success ? navigate('/profile') : setError(res.message || 'Registration failed');
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 50 }}>
      <div className="card card-glass animate-fade-in" style={{ width: '100%', maxWidth: 480, padding: 35 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Create Account</h2>
          <p className="text-muted">Register to get personalized government job matching</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: 10, textAlign: 'center', marginBottom: 20, fontSize: '.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {FIELDS.map((f, i) => (
            <div className="form-group" key={f.name} style={i === FIELDS.length - 1 ? { marginBottom: 30 } : undefined}>
              <label className="form-label" htmlFor={f.name}>{f.label}</label>
              <input type={f.type} id={f.name} name={f.name} className="form-input" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} required />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : 'Register & Set Up Profile'}
          </button>
        </form>

        <div style={{ marginTop: 25, textAlign: 'center', fontSize: '.9rem' }}>
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
