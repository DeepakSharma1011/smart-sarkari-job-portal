import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Award, User, AlertCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Helper to format ISO dates to "25 Oct 2025"
const formatDate = (str) => 
  str ? new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

// Helper to calculate days remaining
const calculateDaysLeft = (str) => {
  if (!str) return 0;
  const diff = Math.ceil((new Date(str) - new Date()) / 86400000);
  return diff > 0 ? diff : 0;
};

// Style match score percentage
const getMatchPercentageClass = (score) => 
  score >= 80 ? 'match-badge' : score >= 50 ? 'match-badge medium' : 'match-badge low';

const RecommendedJobs = () => {
  const { user, showToast } = useAuth();
  
  // --- STATE DEFINITIONS ---
  const [jobs, setJobs] = useState([]); // List of recommended jobs
  const [profileOk, setProfileOk] = useState(false); // Indicates if user has completed their profile
  const [loading, setLoading] = useState(true); // Loading visual spinner state
  const [page, setPage] = useState(1); // Pagination page index
  const [totalPages, setTotalPages] = useState(1); // Total pages calculated by the server
  const [totalEligible, setTotalEligible] = useState(0); // Count of all eligible matches for user

  // --- FETCH RECOMMENDATIONS ---
  // Re-run whenever the pagination page changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Call user-specific recommendation API endpoint
        const response = await fetch(`${API_URL}/api/jobs/recommend/me?page=${page}&limit=6`, { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        });
        const data = await response.json();

        if (data.success) {
          setProfileOk(data.profileComplete);
          setJobs(data.jobs || []);
          setTotalPages(data.totalPages || 1);
          setTotalEligible(data.totalEligible || 0);
        } else {
          showToast(data.message || 'Error fetching recommendations', 'error');
        }
      } catch (err) {
        showToast('Network error loading job recommendations', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [page]);

  return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 70, minHeight: '85vh' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: 45, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <Sparkles className="logo-accent" size={32} /> Recommendations
        </h1>
        <p className="text-muted">Personalized jobs ranked by your eligibility score</p>
      </div>

      {loading ? (
        // Loading Spinner Cards
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 22 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card skeleton-card skeleton" style={{ minHeight: 260 }} />
          ))}
        </div>
      ) : !profileOk ? (
        // Alert State: User profile is incomplete
        <div className="card card-glass animate-fade-up" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: 600, margin: '0 auto' }}>
          <AlertCircle size={64} className="text-danger" style={{ marginBottom: 24, animation: 'float 4s ease-in-out infinite' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>Complete Your Profile</h2>
          <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: 30 }}>
            We need your educational Qualification, Age, and Category to calculate matching jobs.
          </p>
          <Link to="/profile" className="btn btn-primary">Configure Profile</Link>
        </div>
      ) : jobs.length === 0 ? (
        // Empty State: Profile is OK but no jobs qualify
        <div className="card card-glass empty-state" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="empty-icon">🎯</div>
          <h3>No Eligible Matches</h3>
          <p className="text-muted" style={{ marginBottom: 24 }}>No active jobs match your profile requirements currently.</p>
          <Link to="/profile" className="btn btn-outline">Modify Profile</Link>
        </div>
      ) : (
        // Grid View containing Profile Summary sidebar and Recommended Cards
        <div className="profile-grid">
          
          {/* LEFT SIDEBAR: User info summary */}
          <aside>
            <div className="card card-glass" style={{ padding: 26, position: 'sticky', top: 92 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div className="profile-avatar-large">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 12 }}>{user?.name}</h3>
                <span className="badge badge-primary" style={{ marginTop: 8 }}>{user?.category} Category</span>
              </div>
              
              <div className="dropdown-divider" style={{ margin: '20px 0' }} />
              
              {/* Qualification & Age Info list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '.9rem' }}>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '.75rem', textTransform: 'uppercase' }}>Qualification</span>
                  <span style={{ fontWeight: 600 }}>{user?.qualification}</span>
                </div>
                
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '.75rem', textTransform: 'uppercase' }}>Age</span>
                  <span style={{ fontWeight: 600 }}>{user?.age} Years</span>
                </div>
                
                {/* Skills tags list */}
                {user?.skills && user.skills.length > 0 && (
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '.75rem', textTransform: 'uppercase', marginBottom: 4 }}>Skills</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {user.skills.map((s, i) => (
                        <span key={i} className="badge badge-info" style={{ fontSize: '.7rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Interested fields tags list */}
                {user?.interestedFields && user.interestedFields.length > 0 && (
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '.75rem', textTransform: 'uppercase', marginBottom: 4 }}>Fields</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {user.interestedFields.map((f, i) => (
                        <span key={i} className="badge badge-accent" style={{ fontSize: '.7rem' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="dropdown-divider" style={{ margin: '20px 0' }} />
              
              <Link to="/profile" className="btn btn-outline btn-sm" style={{ display: 'block', textAlign: 'center' }}>
                ✏️ Edit Profile
              </Link>
            </div>
          </aside>

          {/* RIGHT SIDE: Jobs list */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span className="text-muted" style={{ fontWeight: 600 }}>Matched {totalEligible} jobs</span>
              <span className="text-muted">Page {page} of {totalPages}</span>
            </div>

            {/* List of matching job cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-fade-in">
              {jobs.map((job) => {
                const daysRemaining = calculateDaysLeft(job.lastDate);
                const isUrgent = (daysRemaining <= 7);
                
                return (
                  <div key={job._id} className="job-card" style={{ display: 'grid', gap: 16 }}>
                    
                    {/* Badge and match percentage */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : 'badge-success'}`}>
                          {job.field}
                        </span>
                        <h3 className="job-card-title" style={{ marginTop: 8, fontSize: '1.2rem' }}>{job.jobName}</h3>
                        <span className="job-card-dept">{job.department}</span>
                      </div>
                      
                      <div className={getMatchPercentageClass(job.matchPercentage)}>
                        🎯 {job.matchPercentage}% Match
                      </div>
                    </div>

                    {/* Requirements summary info box */}
                    <div className="job-card-info" style={{ background: 'var(--surface-alt)', padding: 14, borderRadius: 8 }}>
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>Requires: <strong>{job.qualificationRequired}</strong></span>
                      </div>
                      <div className="job-card-info-item">
                        <User size={16} />
                        <span>Ages: <strong>{job.minAge}-{job.maxAge} yrs</strong></span>
                      </div>
                    </div>

                    {/* Match Criteria Details checklist (how the matching score is built) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <span className="text-muted" style={{ fontSize: '.8rem', fontWeight: 600 }}>Matched:</span>
                      {job.matchDetails?.qualification && (
                        <span className="badge badge-success" style={{ fontSize: '.75rem' }}>✓ Qualification (+15%)</span>
                      )}
                      {job.matchDetails?.age && (
                        <span className="badge badge-success" style={{ fontSize: '.75rem' }}>✓ Comfortable Age (+15%)</span>
                      )}
                      {job.matchDetails?.categoryRelaxation && (
                        <span className="badge badge-warning" style={{ fontSize: '.75rem' }}>✓ Category Relaxation (+10%)</span>
                      )}
                      {job.matchDetails?.field && (
                        <span className="badge badge-primary" style={{ fontSize: '.75rem' }}>✓ Field (+10%)</span>
                      )}
                      {job.matchDetails?.skills?.matched > 0 && (
                        <span className="badge badge-info" style={{ fontSize: '.75rem' }}>✓ Skills Match (+10%)</span>
                      )}
                    </div>

                    {/* Footer with deadline and apply link */}
                    <div className="job-card-footer" style={{ marginTop: 5 }}>
                      <span className={`job-card-deadline ${isUrgent ? 'urgent' : 'safe'}`}>
                        ⏰ Apply By: {formatDate(job.lastDate)} {isUrgent && `(${daysRemaining}d left)`}
                      </span>
                      {job.applyLink && (
                        <a 
                          href={job.applyLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary btn-sm" 
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          Apply <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: 30 }}>
                <button 
                  className="page-btn" 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button 
                    key={p} 
                    className={`page-btn ${page === p ? 'active' : ''}`} 
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                
                <button 
                  className="page-btn" 
                  disabled={page === totalPages} 
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
          
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
