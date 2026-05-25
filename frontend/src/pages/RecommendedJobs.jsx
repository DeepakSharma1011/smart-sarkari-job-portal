import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Award, User, AlertCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
const daysLeft = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));
const matchClass = (pct) => pct >= 80 ? 'match-badge' : pct >= 50 ? 'match-badge medium' : 'match-badge low';

const getPages = (page, total) => {
  const range = [], result = [];
  let prev;
  for (let i = 1; i <= total; i++) if (i === 1 || i === total || Math.abs(i - page) <= 1) range.push(i);
  for (const i of range) {
    if (prev && i - prev === 2) result.push(prev + 1);
    else if (prev && i - prev > 2) result.push('...');
    result.push(i);
    prev = i;
  }
  return result;
};

const RecommendedJobs = () => {
  const { user, showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [profileOk, setProfileOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEligible, setTotalEligible] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const data = await (await fetch(`/api/jobs/recommend/me?page=${page}&limit=6`, { headers: { Authorization: `Bearer ${token}` } })).json();
        if (data.success) { setProfileOk(data.profileComplete); setJobs(data.jobs || []); setTotalPages(data.totalPages || 1); setTotalEligible(data.totalEligible || 0); }
        else showToast(data.message || 'Error fetching recommendations', 'error');
      } catch { showToast('Network error', 'error'); }
      finally { setLoading(false); }
    })();
  }, [page]);

  return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 70, minHeight: '85vh' }}>
      <div style={{ marginBottom: 45, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <Sparkles className="logo-accent" size={32} /> Recommendations
        </h1>
        <p className="text-muted">Personalized jobs ranked by your eligibility score</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 22 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="card skeleton-card skeleton" style={{ minHeight: 260 }} />)}
        </div>
      ) : !profileOk ? (
        <div className="card card-glass animate-fade-up" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: 600, margin: '0 auto' }}>
          <AlertCircle size={64} className="text-danger" style={{ marginBottom: 24, animation: 'float 4s ease-in-out infinite' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>Complete Your Profile</h2>
          <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: 30 }}>We need your Qualification, Age, and Category to calculate match scores.</p>
          <Link to="/profile" className="btn btn-primary">Configure Profile</Link>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card card-glass empty-state" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="empty-icon">🎯</div>
          <h3>No Eligible Matches</h3>
          <p className="text-muted" style={{ marginBottom: 24 }}>No active jobs match your profile currently.</p>
          <Link to="/profile" className="btn btn-outline">Modify Profile</Link>
        </div>
      ) : (
        <div className="profile-grid">
          {/* Left: Profile Summary */}
          <aside>
            <div className="card card-glass" style={{ padding: 26, position: 'sticky', top: 92 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div className="profile-avatar-large">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 12 }}>{user?.name}</h3>
                <span className="badge badge-primary" style={{ marginTop: 8 }}>{user?.category} Category</span>
              </div>
              <div className="dropdown-divider" style={{ margin: '20px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '.9rem' }}>
                {[['Qualification', user?.qualification], ['Age', `${user?.age} Years`]].map(([label, val]) => (
                  <div key={label}><span className="text-muted" style={{ display: 'block', fontSize: '.75rem', textTransform: 'uppercase' }}>{label}</span><span style={{ fontWeight: 600 }}>{val}</span></div>
                ))}
                {user?.skills?.length > 0 && (
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '.75rem', textTransform: 'uppercase', marginBottom: 4 }}>Skills</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {user.skills.map((s, i) => <span key={i} className="badge badge-info" style={{ fontSize: '.7rem' }}>{s}</span>)}
                    </div>
                  </div>
                )}
                {user?.interestedFields?.length > 0 && (
                  <div>
                    <span className="text-muted" style={{ display: 'block', fontSize: '.75rem', textTransform: 'uppercase', marginBottom: 4 }}>Fields</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {user.interestedFields.map((f, i) => <span key={i} className="badge badge-accent" style={{ fontSize: '.7rem' }}>{f}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="dropdown-divider" style={{ margin: '20px 0' }} />
              <Link to="/profile" className="btn btn-outline btn-sm" style={{ display: 'block', textAlign: 'center' }}>✏️ Edit Profile</Link>
            </div>
          </aside>

          {/* Right: Job Cards */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span className="text-muted" style={{ fontWeight: 600 }}>Matched {totalEligible} jobs</span>
              <span className="text-muted">Page {page} of {totalPages}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-fade-in">
              {jobs.map((job) => {
                const days = daysLeft(job.lastDate);
                const urgent = days <= 7;
                return (
                  <div key={job._id} className="job-card" style={{ display: 'grid', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : 'badge-success'}`}>{job.field}</span>
                        <h3 className="job-card-title" style={{ marginTop: 8, fontSize: '1.2rem' }}>{job.jobName}</h3>
                        <span className="job-card-dept">{job.department}</span>
                      </div>
                      <div className={matchClass(job.matchPercentage)}>🎯 {job.matchPercentage}% Match</div>
                    </div>

                    <div className="job-card-info" style={{ background: 'var(--sa)', padding: 14, borderRadius: 8 }}>
                      <div className="job-card-info-item"><Award size={16} /><span>Requires: <strong>{job.qualificationRequired}</strong></span></div>
                      <div className="job-card-info-item"><User size={16} /><span>Ages: <strong>{job.minAge}-{job.maxAge} yrs</strong></span></div>
                    </div>

                    {/* Match Criteria */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <span className="text-muted" style={{ fontSize: '.8rem', fontWeight: 600 }}>Matched:</span>
                      {job.matchDetails?.qualification && <span className="badge badge-success" style={{ fontSize: '.75rem' }}>✓ Qualification (+30)</span>}
                      {job.matchDetails?.age && <span className="badge badge-success" style={{ fontSize: '.75rem' }}>✓ Age (+25)</span>}
                      {job.matchDetails?.categoryRelaxation && <span className="badge badge-warning" style={{ fontSize: '.75rem' }}>✓ Category Relaxation (+10)</span>}
                      {job.matchDetails?.field && <span className="badge badge-primary" style={{ fontSize: '.75rem' }}>✓ Field (+15)</span>}
                      {job.matchDetails?.skills?.matched > 0 && <span className="badge badge-info" style={{ fontSize: '.75rem' }}>✓ {job.matchDetails.skills.matched} Skills</span>}
                    </div>

                    <div className="job-card-footer" style={{ marginTop: 5 }}>
                      <span className={`job-card-deadline ${urgent ? 'urgent' : 'safe'}`}>
                        ⏰ Apply By: {fmtDate(job.lastDate)} {urgent && `(${days}d left)`}
                      </span>
                      {job.applyLink && (
                        <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Apply <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: 30 }}>
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
                {getPages(page, totalPages).map((p, i) =>
                  p === '...'
                    ? <span key={`d${i}`} style={{ padding: '0 8px' }}>...</span>
                    : <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )}
                <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
