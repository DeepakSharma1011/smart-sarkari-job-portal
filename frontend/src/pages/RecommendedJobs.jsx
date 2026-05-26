import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Award, User, AlertCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import './RecommendedJobs.css';

const API_URL = import.meta.env.VITE_API_URL || '';

// Helper to format ISO dates to "25 Oct 2025"
const formatDate = (str) => 
  str ? new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

// Helper to calculate days remaining
const calculateDaysLeft = (str) => {
  if (!str) return 0;
  const diff = Math.ceil((new Date(str) - new Date()) / 86400000); // 86400000 ms in a day
  return diff > 0 ? diff : 0;
};

// Returns style class for match score percentage
const getMatchPercentageClass = (score) => 
  score >= 80 ? 'match-badge' : score >= 50 ? 'match-badge medium' : 'match-badge low';

const RecommendedJobs = () => {
  // Access logged-in user profile and toast notifications from context
  const { user, showToast } = useAuth();
  
  // --- STATE DEFINITIONS ---
  const [jobs, setJobs] = useState([]); // List of recommended jobs matching user eligibility
  const [profileOk, setProfileOk] = useState(false); // Tracks if the user's profile is complete
  const [loading, setLoading] = useState(true); // Shows a loader while fetching data
  const [page, setPage] = useState(1); // Current page index for pagination
  const [totalPages, setTotalPages] = useState(1); // Total pages calculated by the server
  const [totalEligible, setTotalEligible] = useState(0); // Count of total jobs the user qualifies for

  // --- FETCH RECOMMENDATIONS ---
  // Re-runs whenever the page changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Fetch personalized job recommendations from backend
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
    <div className="container rec-page-container">
      
      {/* Header */}
      <div className="rec-header">
        <h1 className="rec-title">
          <Sparkles className="logo-accent" size={32} /> Recommendations
        </h1>
        <p className="text-muted">Personalized jobs ranked by your eligibility score</p>
      </div>

      {loading ? (
        // 1. Loading State (Skeleton layout)
        <div className="rec-skeleton-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card skeleton-card skeleton rec-skeleton-card" />
          ))}
        </div>
      ) : !profileOk ? (
        // 2. Profile Incomplete State: prompt user to complete profile details first
        <div className="card card-glass animate-fade-up rec-incomplete-card">
          <AlertCircle size={64} className="text-danger rec-incomplete-icon" />
          <h2 className="rec-incomplete-title">Complete Your Profile</h2>
          <p className="text-muted rec-incomplete-text">
            We need your educational Qualification, Age, and Category to calculate matching jobs.
          </p>
          <Link to="/profile" className="btn btn-primary">Configure Profile</Link>
        </div>
      ) : jobs.length === 0 ? (
        // 3. No Matches Found State
        <div className="card card-glass empty-state rec-empty-card">
          <div className="empty-icon">🎯</div>
          <h3>No Eligible Matches</h3>
          <p className="text-muted rec-empty-text">No active jobs match your profile requirements currently.</p>
          <Link to="/profile" className="btn btn-outline">Modify Profile</Link>
        </div>
      ) : (
        // 4. Results State: Show Profile Summary Sidebar (Left) and Jobs Grid List (Right)
        <div className="profile-grid">
          
          {/* LEFT SIDEBAR: Current profile values */}
          <aside>
            <div className="card card-glass rec-sidebar-card">
              <div className="rec-sidebar-header">
                <div className="profile-avatar-large">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <h3 className="rec-sidebar-name">{user?.name}</h3>
                <span className="badge badge-primary rec-sidebar-badge">{user?.category} Category</span>
              </div>
              
              <div className="dropdown-divider rec-sidebar-divider" />
              
              <div className="rec-sidebar-details">
                <div>
                  <span className="text-muted rec-sidebar-label">Qualification</span>
                  <span className="rec-sidebar-value">{user?.qualification}</span>
                </div>
                
                <div>
                  <span className="text-muted rec-sidebar-label">Age</span>
                  <span className="rec-sidebar-value">{user?.age} Years</span>
                </div>
                
                {/* User Skills list */}
                {user?.skills && user.skills.length > 0 && (
                  <div>
                    <span className="text-muted rec-sidebar-label-mb">Skills</span>
                    <div className="rec-sidebar-list">
                      {user.skills.map((s, i) => (
                        <span key={i} className="badge badge-info rec-sidebar-item">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* User Interested Sectors */}
                {user?.interestedFields && user.interestedFields.length > 0 && (
                  <div>
                    <span className="text-muted rec-sidebar-label-mb">Fields</span>
                    <div className="rec-sidebar-list">
                      {user.interestedFields.map((f, i) => (
                        <span key={i} className="badge badge-accent rec-sidebar-item">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="dropdown-divider rec-sidebar-divider" />
              
              <Link to="/profile" className="btn btn-outline btn-sm rec-sidebar-btn">
                ✏️ Edit Profile
              </Link>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT: Recommended Job Cards */}
          <main>
            <div className="rec-main-summary">
              <span className="text-muted rec-main-summary-text">Matched {totalEligible} jobs</span>
              <span className="text-muted">Page {page} of {totalPages}</span>
            </div>

            {/* List of recommended job cards */}
            <div className="animate-fade-in rec-jobs-list">
              {jobs.map((job) => {
                const daysRemaining = calculateDaysLeft(job.lastDate);
                const isUrgent = (daysRemaining <= 7);
                
                return (
                  <div key={job._id} className="job-card rec-job-card">
                    
                    {/* Header: Title, Department and Eligibility percentage */}
                    <div className="rec-job-header">
                      <div>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : job.field === 'Railway' ? 'badge-success' : 'badge-info'}`}>
                          {job.field}
                        </span>
                        <h3 className="job-card-title rec-job-title">{job.jobName}</h3>
                        <span className="job-card-dept">{job.department}</span>
                      </div>
                      
                      <div className={getMatchPercentageClass(job.matchPercentage)}>
                        🎯 {job.matchPercentage}% Match
                      </div>
                    </div>

                    {/* Specifications Box */}
                    <div className="job-card-info rec-job-specs">
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>Requires: <strong>{job.qualificationRequired}</strong></span>
                      </div>
                      <div className="job-card-info-item">
                        <User size={16} />
                        <span>Ages: <strong>{job.minAge}-{job.maxAge} yrs</strong></span>
                      </div>
                    </div>

                    {/* Match Score breakdown indicators */}
                    <div className="rec-job-match-indicators">
                      <span className="text-muted rec-job-match-label">Matched:</span>
                      {job.matchDetails?.qualification && (
                        <span className="badge badge-success rec-job-match-badge">✓ Qualification (+15%)</span>
                      )}
                      {job.matchDetails?.age && (
                        <span className="badge badge-success rec-job-match-badge">✓ Comfortable Age (+15%)</span>
                      )}
                      {job.matchDetails?.categoryRelaxation && (
                        <span className="badge badge-warning rec-job-match-badge">✓ Category Relaxation (+10%)</span>
                      )}
                      {job.matchDetails?.field && (
                        <span className="badge badge-primary rec-job-match-badge">✓ Field (+10%)</span>
                      )}
                      {job.matchDetails?.skills?.matched > 0 && (
                        <span className="badge badge-info rec-job-match-badge">✓ Skills Match (+10%)</span>
                      )}
                    </div>

                    {/* Footer: Date and apply action button */}
                    <div className="job-card-footer rec-job-footer">
                      <span className={`job-card-deadline ${isUrgent ? 'urgent' : 'safe'}`}>
                        ⏰ Apply By: {formatDate(job.lastDate)} {isUrgent && `(${daysRemaining}d left)`}
                      </span>
                      {job.applyLink && (
                        <a 
                          href={job.applyLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary btn-sm rec-apply-btn"
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
              <div className="pagination rec-pagination">
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
