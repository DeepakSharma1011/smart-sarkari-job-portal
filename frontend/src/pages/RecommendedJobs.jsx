import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Award, User, Target, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const RecommendedJobs = () => {
  const { user, showToast } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEligible, setTotalEligible] = useState(0);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/jobs/recommend/me?page=${page}&limit=6`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfileComplete(data.profileComplete);
        setRecommendations(data.jobs || []);
        setTotalPages(data.totalPages || 1);
        setTotalEligible(data.totalEligible || 0);
      } else {
        showToast(data.message || 'Error fetching recommendations', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error loading recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [page]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (lastDateStr) => {
    const diff = new Date(lastDateStr) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getMatchBadgeClass = (percentage) => {
    if (percentage >= 80) return 'match-badge'; // green
    if (percentage >= 50) return 'match-badge medium'; // orange
    return 'match-badge low'; // slate/gray
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '70px', minHeight: '85vh' }}>
      {/* Title */}
      <div style={{ marginBottom: '45px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles className="logo-accent" size={32} /> Recommendations Dashboard
        </h1>
        <p className="text-muted">A personalized feed of government job openings ranked by your eligibility score</p>
      </div>

      {loading ? (
        /* Loading skeletons */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '22px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card skeleton-card skeleton" style={{ minHeight: '260px' }}></div>
          ))}
        </div>
      ) : !profileComplete ? (
        /* Incomplete Profile Alert */
        <div className="card card-glass animate-fade-up" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '600px', margin: '0 auto' }}>
          <AlertCircle size={64} className="text-danger" style={{ marginBottom: '24px', animation: 'float 4s ease-in-out infinite' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Complete Your Profile</h2>
          <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: '30px' }}>
            We need your Qualification, Age, and Category to compute eligibility relaxations and calculate match percentages.
          </p>
          <Link to="/profile" className="btn btn-primary">
            Configure Profile Now
          </Link>
        </div>
      ) : recommendations.length === 0 ? (
        /* Empty Recommendations */
        <div className="card card-glass empty-state" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="empty-icon">🎯</div>
          <h3>No Eligible Matches Found</h3>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            There are currently no active job vacancies in the system that match your Profile details.
          </p>
          <div style={{ background: 'var(--surface-alt)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'left', marginBottom: '25px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Filter Criteria:</h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <li>🎓 Qualification: <strong>{user?.qualification}</strong></li>
              <li>📅 Current Age: <strong>{user?.age} Years</strong></li>
              <li>👤 Category Group: <strong>{user?.category}</strong></li>
              <li>🏷️ Interested Fields: <strong>{user?.interestedFields?.join(', ') || 'Any'}</strong></li>
            </ul>
          </div>
          <Link to="/profile" className="btn btn-outline">
            Modify Profile Settings
          </Link>
        </div>
      ) : (
        /* Layout Grid */
        <div className="profile-grid">
          {/* Left Panel: Profile Summary Card */}
          <aside>
            <div className="card card-glass" style={{ padding: '26px', position: 'sticky', top: '92px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div className="profile-avatar-large">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '12px' }}>{user?.name}</h3>
                <span className="badge badge-primary" style={{ marginTop: '8px' }}>
                  {user?.category} Category
                </span>
              </div>

              <div className="dropdown-divider" style={{ margin: '20px 0' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Academic Qualification</span>
                  <span style={{ fontWeight: 600 }}>{user?.qualification}</span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Current Age</span>
                  <span style={{ fontWeight: 600 }}>{user?.age} Years Old</span>
                </div>
                {user?.skills && user.skills.length > 0 && (
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Skills Inventory</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {user.skills.map((skill, idx) => (
                        <span key={idx} className="badge badge-info" style={{ fontSize: '0.7rem' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {user?.interestedFields && user.interestedFields.length > 0 && (
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Preferred Exam Fields</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {user.interestedFields.map((field, idx) => (
                        <span key={idx} className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{field}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="dropdown-divider" style={{ margin: '20px 0' }}></div>
              <Link to="/profile" className="btn btn-outline btn-sm" style={{ display: 'block', textAlign: 'center' }}>
                ✏️ Edit Profile Info
              </Link>
            </div>
          </aside>

          {/* Right Panel: Scoring Listings */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="text-muted" style={{ fontWeight: 600 }}>
                Matched {totalEligible} jobs based on your criteria
              </span>
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
              {recommendations.map((job) => {
                const daysLeft = getDaysRemaining(job.lastDate);
                const isUrgent = daysLeft <= 7;
                return (
                  <div key={job._id} className="job-card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : 'badge-success'}`}>
                          {job.field}
                        </span>
                        <h3 className="job-card-title" style={{ marginTop: '8px', fontSize: '1.2rem' }}>{job.jobName}</h3>
                        <span className="job-card-dept">{job.department}</span>
                      </div>
                      
                      <div className={getMatchBadgeClass(job.matchPercentage)}>
                        🎯 {job.matchPercentage}% Match
                      </div>
                    </div>

                    <div className="job-card-info" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>Requires: <strong>{job.qualificationRequired}</strong></span>
                      </div>
                      <div className="job-card-info-item">
                        <User size={16} />
                        <span>Ages: <strong>{job.minAge}-{job.maxAge} yrs</strong></span>
                      </div>
                    </div>

                    {/* Matching Reason Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Matched criteria:</span>
                      {job.matchDetails?.qualification && (
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Qualification Matched (+30)</span>
                      )}
                      {job.matchDetails?.age && (
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Age Criteria Approved (+25)</span>
                      )}
                      {job.matchDetails?.categoryRelaxation && (
                        <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>✓ Category Relaxation Used (+10)</span>
                      )}
                      {job.matchDetails?.field && (
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>✓ Target Field Overlap (+15)</span>
                      )}
                      {job.matchDetails?.skills && job.matchDetails.skills.matched > 0 && (
                        <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>✓ {job.matchDetails.skills.matched} Skills Matched</span>
                      )}
                    </div>

                    <div className="job-card-footer" style={{ marginTop: '5px', paddingContext: 0, border: 'none' }}>
                      <span className={`job-card-deadline ${isUrgent ? 'urgent' : 'safe'}`}>
                        ⏰ Apply By: {formatDate(job.lastDate)} {isUrgent && `(${daysLeft} days left)`}
                      </span>
                      {job.applyLink && (
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Apply Online <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: '30px' }}>
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {(() => {
                  const delta = 1;
                  const range = [];
                  const rangeWithDots = [];
                  let l;

                  for (let i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                      range.push(i);
                    }
                  }

                  for (let i of range) {
                    if (l) {
                      if (i - l === 2) {
                        rangeWithDots.push(l + 1);
                      } else if (i - l > 2) {
                        rangeWithDots.push('...');
                      }
                    }
                    rangeWithDots.push(i);
                    l = i;
                  }

                  return rangeWithDots.map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`dots-${idx}`} className="page-dots" style={{ padding: '0 8px', color: 'var(--text-muted)' }}>
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={p}
                        className={`page-btn ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}
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
