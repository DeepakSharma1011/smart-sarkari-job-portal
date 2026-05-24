import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 15284,
    aspirants: 284000,
    matches: 98.4
  });

  // Animated numbers for landing
  const [animatedStats, setAnimatedStats] = useState({
    activeJobs: 0,
    aspirants: 0,
    matches: 0
  });

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setAnimatedStats({
        activeJobs: Math.floor((stats.activeJobs / steps) * step),
        aspirants: Math.floor((stats.aspirants / steps) * step),
        matches: parseFloat(((stats.matches / steps) * step).toFixed(1))
      });

      if (step >= steps) {
        setAnimatedStats(stats);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [stats]);

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', padding: '100px 0 80px', background: 'linear-gradient(135deg, #0a0720 0%, #0f0a2e 50%, #170f44 100%)', color: '#fff' }}>
        {/* Floating Ambient Light Orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'orbFloat1 15s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'orbFloat2 18s ease-in-out infinite' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px', alignItems: 'center' }}>
            <div className="animate-fade-up">
              <div className="badge badge-primary" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-glow)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '20px', padding: '6px 14px', fontSize: '0.85rem' }}>
                🚀 Personalized AI Matching Engine
              </div>
              <h1 style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '24px', letterSpacing: '-0.02em' }}>
                Find Government Jobs You Are <span className="logo-accent">Eligible</span> For
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', marginBottom: '36px', lineHeight: 1.7, maxWidth: '600px' }}>
                Stop checking multiple websites. Complete your profile once, and our recommendation engine filters matching Sarkari Result listings based on your exact Age, Category, and Qualification!
              </p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Link to="/recommendations" className="btn btn-primary btn-lg">
                    View Recommended Jobs <ChevronRight size={18} />
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create Free Profile <ChevronRight size={18} />
                  </Link>
                )}
                <Link to="/jobs" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Browse All Jobs
                </Link>
              </div>
            </div>

            <div className="hero-image-wrapper animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="card card-glass" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', padding: '30px', color: '#fff', width: '100%', maxWidth: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} className="logo-accent" /> Dynamic Profiler
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>QUALIFICATION</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Graduation (B.Tech / B.Sc)</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>AGE & CATEGORY</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>24 Years / OBC (+3 Relaxation)</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>INTERESTED FIELDS</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Banking, SSC, Railway</div>
                  </div>

                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>Eligible Matches:</span>
                    <span className="badge badge-success" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--success)' }}>
                      98+ Vacancies
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section style={{ padding: '50px 0', background: '#fff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            <div className="stat-card">
              <span className="stat-icon">💼</span>
              <div className="stat-number">{animatedStats.activeJobs.toLocaleString()}</div>
              <div className="stat-label">Active Vacancies Synced</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">👨‍🎓</span>
              <div className="stat-number">{(animatedStats.aspirants / 1000).toFixed(0)}K+</div>
              <div className="stat-label">Registered Aspirants</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <div className="stat-number">{animatedStats.matches}%</div>
              <div className="stat-label">Matching Recommendation Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', background: 'var(--surface-alt)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>Portal Features</h2>
            <p className="text-muted" style={{ fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              We offer several tools to simplify your exam preparation and career matching.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="card shadow-sm" style={{ padding: '30px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContext: 'center', marginBottom: '20px', padding: '12px' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Smart Recommendation</h3>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>
                Matches age with category relaxation, checks qualification hierarchy, and displays only the job vacancies you are actually eligible to apply for.
              </p>
            </div>

            <div className="card shadow-sm" style={{ padding: '30px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContext: 'center', marginBottom: '20px', padding: '12px' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Real-time API Sync</h3>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>
                Directly fetches from official Sarkari Result endpoints, avoiding manual entry errors and guaranteeing you never miss a newly released vacancy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
