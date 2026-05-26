import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';

// Hardcoded statistics for the portal (shown as starting numbers for animation)
const REAL_STATS = { 
  activeJobs: 15284, 
  aspirants: 284000, 
  matches: 98.4 
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  // State to hold the current animated numbers shown on the dashboard
  const [animatedStats, setAnimatedStats] = useState({ 
    activeJobs: 0, 
    aspirants: 0, 
    matches: 0 
  });

  // --- COUNTER NUMBER ANIMATION ---
  // When the home page loads (mounts), we run an interval to animate the stat numbers from 0 up to their real values
  useEffect(() => {
    let currentStep = 0;
    const totalSteps = 60; // The animation will complete in 60 increments (steps)
    
    const intervalTimer = setInterval(() => {
      currentStep++;
      
      // Calculate the progress fraction for the current step
      const fraction = currentStep / totalSteps;
      
      setAnimatedStats({
        activeJobs: Math.floor(REAL_STATS.activeJobs * fraction),
        aspirants: Math.floor(REAL_STATS.aspirants * fraction),
        matches: parseFloat((REAL_STATS.matches * fraction).toFixed(1)),
      });
      
      // If we have completed all steps, clear the interval timer and set stats to final exact values
      if (currentStep >= totalSteps) {
        setAnimatedStats(REAL_STATS);
        clearInterval(intervalTimer);
      }
    }, 25); // Run every 25 milliseconds (about 1.5 seconds total animation time)
    
    // Cleanup function: clears the timer if the user navigates away from this page before the animation completes
    return () => clearInterval(intervalTimer);
  }, []);

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* --- HERO SECTION --- */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 0 80px', background: 'linear-gradient(135deg, #0a0720, #0f0a2e 50%, #170f44)', color: '#fff' }}>
        {/* Floating gradient background circles (visual design) */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.15), transparent 70%)', filter: 'blur(40px)', animation: 'orbFloat1 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.08), transparent 70%)', filter: 'blur(50px)', animation: 'orbFloat2 18s ease-in-out infinite' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 50, alignItems: 'center' }}>
            
            {/* Hero Left Content */}
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
              
              {/* Call to Actions */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Link to="/recommendations" className="btn btn-primary btn-lg">
                    View Recommended Jobs <ChevronRight size={18} />
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create Free Profile <ChevronRight size={18} />
                  </Link>
                )}
                <Link to="/jobs" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
                  Browse All Jobs
                </Link>
              </div>
            </div>

            {/* Hero Right Content: Visual Demo Card */}
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="card card-glass" style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', padding: 30, color: '#fff', maxWidth: 380, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={20} className="logo-accent" /> Dynamic Profiler
                </h3>
                
                {/* Simulated profile inputs */}
                <div style={{ background: 'rgba(255,255,255,.03)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.05)', marginBottom: 12 }}>
                  <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.5)' }}>QUALIFICATION</div>
                  <div style={{ fontWeight: 600 }}>Graduation (B.Tech / B.Sc)</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.05)', marginBottom: 12 }}>
                  <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.5)' }}>AGE & CATEGORY</div>
                  <div style={{ fontWeight: 600 }}>24 Years / OBC (+3 Relaxation)</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.05)', marginBottom: 12 }}>
                  <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.5)' }}>INTERESTED FIELDS</div>
                  <div style={{ fontWeight: 600 }}>Banking, SSC, Railway</div>
                </div>

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

      {/* --- STATISTICS SECTION --- */}
      <section style={{ padding: '50px 0', background: '#fff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
            
            {/* Stat Item 1 */}
            <div className="stat-card">
              <span className="stat-icon">💼</span>
              <div className="stat-number">{animatedStats.activeJobs.toLocaleString()}</div>
              <div className="stat-label">Active Vacancies Synced</div>
            </div>

            {/* Stat Item 2 */}
            <div className="stat-card">
              <span className="stat-icon">👨‍🎓</span>
              <div className="stat-number">{(animatedStats.aspirants / 1000).toFixed(0)}K+</div>
              <div className="stat-label">Registered Aspirants</div>
            </div>

            {/* Stat Item 3 */}
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <div className="stat-number">{animatedStats.matches}%</div>
              <div className="stat-label">Matching Accuracy</div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section style={{ padding: '80px 0', background: 'var(--surface-alt)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 16 }}>Portal Features</h2>
            <p className="text-muted" style={{ fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>Tools to simplify your exam preparation and career matching.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30 }}>
            
            {/* Feature 1 */}
            <div className="card shadow-sm" style={{ padding: 30 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Smart Recommendation</h3>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>
                Matches your age with category relaxation rules, evaluates educational qualifications hierarchy, and recommends only the jobs you are fully eligible to apply for.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card shadow-sm" style={{ padding: 30 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Real-time API Sync</h3>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>
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
