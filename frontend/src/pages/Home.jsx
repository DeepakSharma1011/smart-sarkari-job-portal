import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';

const STATS = { activeJobs: 15284, aspirants: 284000, matches: 98.4 };

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [anim, setAnim] = useState({ activeJobs: 0, aspirants: 0, matches: 0 });

  // Animate counter numbers on mount
  useEffect(() => {
    let step = 0;
    const total = 60;
    const timer = setInterval(() => {
      step++;
      setAnim({
        activeJobs: Math.floor((STATS.activeJobs / total) * step),
        aspirants: Math.floor((STATS.aspirants / total) * step),
        matches: parseFloat(((STATS.matches / total) * step).toFixed(1)),
      });
      if (step >= total) { setAnim(STATS); clearInterval(timer); }
    }, 25);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 0 80px', background: 'linear-gradient(135deg, #0a0720, #0f0a2e 50%, #170f44)', color: '#fff' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.15), transparent 70%)', filter: 'blur(40px)', animation: 'orbFloat1 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.08), transparent 70%)', filter: 'blur(50px)', animation: 'orbFloat2 18s ease-in-out infinite' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 50, alignItems: 'center' }}>
            {/* Left: Text */}
            <div className="animate-fade-up">
              <div className="badge badge-primary" style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.25)', marginBottom: 20, padding: '6px 14px' }}>
                🚀 Personalized AI Matching Engine
              </div>
              <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.15, marginBottom: 24 }}>
                Find Government Jobs You Are <span className="logo-accent">Eligible</span> For
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,.7)', marginBottom: 36, lineHeight: 1.7, maxWidth: 600 }}>
                Stop checking multiple websites. Complete your profile once, and our engine filters matching jobs based on your Age, Category, and Qualification!
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to={isAuthenticated ? '/recommendations' : '/register'} className="btn btn-primary btn-lg">
                  {isAuthenticated ? 'View Recommended Jobs' : 'Create Free Profile'} <ChevronRight size={18} />
                </Link>
                <Link to="/jobs" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Browse All Jobs</Link>
              </div>
            </div>

            {/* Right: Profile Preview Card */}
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="card card-glass" style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', padding: 30, color: '#fff', maxWidth: 380, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={20} className="logo-accent" /> Dynamic Profiler
                </h3>
                {[
                  ['QUALIFICATION', 'Graduation (B.Tech / B.Sc)'],
                  ['AGE & CATEGORY', '24 Years / OBC (+3 Relaxation)'],
                  ['INTERESTED FIELDS', 'Banking, SSC, Railway'],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,.03)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.05)', marginBottom: 12 }}>
                    <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.5)' }}>{label}</div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
                <div style={{ height: 2, background: 'rgba(255,255,255,.1)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.7)' }}>Eligible Matches:</span>
                  <span className="badge badge-success" style={{ background: 'rgba(16,185,129,.2)' }}>98+ Vacancies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '50px 0', background: '#fff', borderBottom: '1px solid var(--bl)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
            {[
              ['💼', anim.activeJobs.toLocaleString(), 'Active Vacancies Synced'],
              ['👨‍🎓', `${(anim.aspirants / 1000).toFixed(0)}K+`, 'Registered Aspirants'],
              ['🎯', `${anim.matches}%`, 'Matching Accuracy'],
            ].map(([icon, num, label]) => (
              <div key={label} className="stat-card">
                <span className="stat-icon">{icon}</span>
                <div className="stat-number">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0', background: 'var(--sa)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 16 }}>Portal Features</h2>
            <p className="text-muted" style={{ fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>Tools to simplify your exam preparation and career matching.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30 }}>
            {[
              [<Sparkles size={24} />, 'Smart Recommendation', 'Matches age with category relaxation, checks qualification hierarchy, and shows only jobs you are eligible for.'],
              [<ShieldCheck size={24} />, 'Real-time API Sync', 'Fetches from official Sarkari Result endpoints, avoiding manual errors and ensuring you never miss a new vacancy.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="card shadow-sm" style={{ padding: 30 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>{title}</h3>
                <p className="text-muted" style={{ lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
