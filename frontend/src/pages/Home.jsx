import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 15284,
    aspirants: 284000,
    matches: 98.4
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/jobs/stats`);
        const data = await response.json();
        if (data.success) {
          setStats({
            activeJobs: data.activeJobs,
            aspirants: data.aspirants,
            matches: data.matchingAccuracy
          });
        }
      } catch (err) {
        console.error('Error fetching portal stats:', err);
      }
    };
    fetchStats();
  }, []);
  
  return (
    <div className="home-page">
      
      {/* --- HERO SECTION --- */}
      <section className="home-hero-section">
        <div className="container">
          <div className="home-hero-grid">
            
            {/* Hero Left Content */}
            <div className="animate-fade-up">
              <div className="badge badge-primary home-hero-badge">
                🚀 Personalized AI Matching Engine
              </div>
              <h1 className="home-hero-title">
                Find Government Jobs You Are <span className="logo-accent">Eligible</span> For
              </h1>
              <p className="home-hero-subtitle">
                Stop checking multiple websites. Complete your profile once, and our engine filters matching jobs based on your Age, Category, and Qualification!
              </p>
              
              {/* Action Buttons */}
              <div className="home-hero-actions">
                {isAuthenticated ? (
                  <Link to="/recommendations" className="btn btn-primary btn-lg">
                    View Recommended Jobs <ChevronRight size={18} />
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create Free Profile <ChevronRight size={18} />
                  </Link>
                )}
                <Link to="/jobs" className="btn btn-outline btn-lg home-hero-btn-outline">
                  Browse All Jobs
                </Link>
              </div>
            </div>

            {/* Hero Right Content: Visual Demo Card */}
            <div className="animate-fade-in home-demo-wrapper">
              <div className="card card-glass home-demo-card">
                <h3 className="home-demo-title">
                  <Sparkles size={18} className="logo-accent" /> Dynamic Profiler
                </h3>
                <div className="home-demo-item">
                  <strong>Graduation (B.Tech / B.Sc)</strong>
                </div>
                <div className="home-demo-item">
                  <strong>24 Years / OBC (+3 Relaxation)</strong>
                </div>
                <div className="home-demo-divider" />
                <div className="home-demo-footer">
                  <span className="home-demo-footer-text">Eligible Matches:</span>
                  <span className="badge badge-success">98+ Vacancies</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STATISTICS SECTION --- */}
      <section className="home-stats-section">
        <div className="container">
          <div className="home-stats-grid">
            <div className="stat-card home-stat-card">
              <span className="stat-icon home-stat-icon">💼</span>
              <div className="stat-number home-stat-number">{stats.activeJobs.toLocaleString()}</div>
              <div className="stat-label home-stat-label">Active Vacancies Synced</div>
            </div>
            <div className="stat-card home-stat-card">
              <span className="stat-icon home-stat-icon">👨‍🎓</span>
              <div className="stat-number home-stat-number">
                {stats.aspirants >= 1000 
                  ? `${(stats.aspirants / 1000).toFixed(0)}K+` 
                  : stats.aspirants}
              </div>
              <div className="stat-label home-stat-label">Registered Aspirants</div>
            </div>
            <div className="stat-card home-stat-card">
              <span className="stat-icon home-stat-icon">🎯</span>
              <div className="stat-number home-stat-number">{stats.matches}%</div>
              <div className="stat-label home-stat-label">Matching Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="home-features-section">
        <div className="container">
          <div className="home-features-header">
            <h2 className="home-features-title">Portal Features</h2>
            <p className="text-muted">Tools to simplify your career matching.</p>
          </div>
          <div className="home-features-grid">
            <div className="card shadow-sm home-feature-card">
              <div className="home-feature-icon-box">
                <Sparkles size={20} />
              </div>
              <h3 className="home-feature-title">Smart Recommendation</h3>
              <p className="text-muted home-feature-desc">
                Matches your age with category relaxation rules, evaluates educational qualifications hierarchy, and recommends only the jobs you are fully eligible to apply for.
              </p>
            </div>
            <div className="card shadow-sm home-feature-card">
              <div className="home-feature-icon-box">
                <ShieldCheck size={20} />
              </div>
              <h3 className="home-feature-title">Real-time API Sync</h3>
              <p className="text-muted home-feature-desc">
                Fetches government job vacancies in real-time from automated scrapers, saving you from check-up errors and ensuring you get notifications immediately.
              </p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
