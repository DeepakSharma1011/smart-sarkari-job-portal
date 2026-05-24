import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Award, Calendar, Sparkles, Plus, X } from 'lucide-react';

const QUALIFICATIONS = ['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'];
const FIELDS = ['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'Other'];

const Profile = () => {
  const { user, token, updateProfileState, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    qualification: 'Graduation',
    category: 'General',
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [interestedFields, setInterestedFields] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (!token) return;

        const response = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          const u = data.user;
          setFormData({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            age: u.age || '',
            qualification: u.qualification || 'Graduation',
            category: u.category || 'General',
          });
          setSkills(u.skills || []);
          setInterestedFields(u.interestedFields || []);
        } else {
          showToast(data.message || 'Error loading profile', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Network error loading profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Chips input helpers
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Multi select check field helpers
  const handleFieldToggle = (field) => {
    if (interestedFields.includes(field)) {
      setInterestedFields(interestedFields.filter((f) => f !== field));
    } else {
      setInterestedFields([...interestedFields, field]);
    }
  };

  // Profile Completeness metric calculation
  const calculateCompleteness = () => {
    let score = 0;
    let total = 6;
    if (formData.name) score++;
    if (formData.email) score++;
    if (formData.phone) score++;
    if (formData.age) score++;
    if (formData.qualification) score++;
    if (formData.category) score++;
    
    // skills and fields add optional points
    let bonus = 0;
    if (skills.length > 0) bonus += 5;
    if (interestedFields.length > 0) bonus += 5;

    const basePct = Math.round((score / total) * 90);
    return Math.min(100, basePct + bonus);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) {
      showToast('Name and Age are required fields', 'error');
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 15 || ageNum > 65) {
      showToast('Age must be a number between 15 and 65', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          age: ageNum,
          skills,
          interestedFields,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast('Profile settings saved successfully!', 'success');
        updateProfileState(data.user);
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving profile settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const completeness = calculateCompleteness();

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '70px', minHeight: '85vh' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>Profile Settings</h1>
        <p className="text-muted">Fill in your qualification and preferences to get personalized matching jobs</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div className="card skeleton skeleton-card" style={{ height: '250px' }}></div>
          <div className="card skeleton skeleton-card" style={{ height: '550px' }}></div>
        </div>
      ) : (
        <div className="profile-grid animate-fade-in">
          {/* Left Panel: Profile Avatar & Completeness */}
          <aside>
            <div className="card card-glass" style={{ padding: '26px', textAlign: 'center', position: 'sticky', top: '92px' }}>
              <div className="profile-avatar-large">
                {formData.name ? formData.name[0].toUpperCase() : 'U'}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>{formData.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '20px' }}>{formData.email}</p>
              
              <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>
                  <span>Profile Completeness</span>
                  <span>{completeness}%</span>
                </div>
                <div className="progress-ring">
                  <div className="progress-ring-fill" style={{ width: `${completeness}%` }}></div>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', lineHeight: '1.5', color: completeness === 100 ? 'var(--success)' : 'var(--text-secondary)' }}>
                {completeness === 100
                  ? '🎉 Excellent! Your profile is complete and matching is active!'
                  : '💡 Complete all details to get the most accurate jobs recommended for you.'}
              </p>
            </div>
          </aside>

          {/* Right Panel: Profile Editor Form */}
          <main>
            <div className="card shadow-sm" style={{ padding: '35px' }}>
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} className="logo-accent" /> Account Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      disabled
                      style={{ background: 'var(--surface-alt)', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="age">Age * (for eligibility checks)</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      className="form-input"
                      min="15"
                      max="65"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="dropdown-divider" style={{ margin: '24px 0' }}></div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} className="logo-accent" /> Eligibility Settings
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qualification">Highest Qualification *</label>
                    <select
                      id="qualification"
                      name="qualification"
                      className="form-input form-select"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                    >
                      {QUALIFICATIONS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">Category Group * (for relaxations)</label>
                    <select
                      id="category"
                      name="category"
                      className="form-input form-select"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="skillInput">Skill Sets (Type skill and press Enter)</label>
                  <div className="chips-container">
                    {skills.map((skill, index) => (
                      <span key={index} className="chip">
                        {skill}
                        <X size={12} className="chip-remove" onClick={() => handleRemoveSkill(skill)} />
                      </span>
                    ))}
                    <input
                      type="text"
                      id="skillInput"
                      className="chip-input"
                      placeholder={skills.length === 0 ? "e.g. Reasoning, Typing, Programming..." : ""}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '35px' }}>
                  <label className="form-label">Interested Job Fields</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    {FIELDS.map((field) => {
                      const isChecked = interestedFields.includes(field);
                      return (
                        <div
                          key={field}
                          onClick={() => handleFieldToggle(field)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid',
                            borderColor: isChecked ? 'var(--primary-light)' : 'var(--border)',
                            background: isChecked ? 'var(--primary-bg)' : 'var(--surface)',
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            color: isChecked ? 'var(--primary-light)' : 'var(--text-secondary)',
                            transition: 'var(--transition-fast)',
                          }}
                        >
                          {field}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'flex', marginLeft: 'auto', padding: '14px 34px' }} disabled={saving}>
                  {saving ? <span className="spinner"></span> : 'Save Changes'}
                </button>
              </form>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Profile;
