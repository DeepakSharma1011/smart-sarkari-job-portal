import { useState, useEffect } from 'react';
import { Search, Award, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FIELDS = ['All', 'SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'IT & CS', 'Other'];
const QUALS = ['All', '10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];

// Helper: format date to "5 Jan 2025"
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

// Helper: days until deadline
const daysLeft = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));

// Helper: generate pagination with dots
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

const Jobs = () => {
  const { showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [field, setField] = useState('All');
  const [qual, setQual] = useState('All');
  const [sortBy, setSortBy] = useState('lastDate');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Read field from URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('field');
    if (p && FIELDS.includes(p)) setField(p);
  }, []);

  // Fetch jobs when filters change
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let url = `/api/jobs?page=${page}&limit=9`;
        if (search) url += `&keyword=${encodeURIComponent(search)}`;
        if (field !== 'All') url += `&field=${encodeURIComponent(field)}`;
        if (qual !== 'All') url += `&qualificationRequired=${encodeURIComponent(qual)}`;
        if (sortBy) url += `&sort=${sortBy}`;

        const data = await (await fetch(url)).json();
        if (data.success) { setJobs(data.jobs); setTotalPages(data.totalPages); setTotalJobs(data.totalJobs); }
        else showToast(data.message || 'Error fetching jobs', 'error');
      } catch { showToast('Failed to load jobs', 'error'); }
      finally { setLoading(false); }
    })();
  }, [search, field, qual, sortBy, page]);

  const resetPage = (setter) => (val) => { setter(val); setPage(1); };

  return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 70, minHeight: '80vh' }}>
      {/* Title */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 10 }}>Government Job Board</h1>
        <p className="text-muted">Real-time vacancies synced from Sarkari Result APIs</p>
      </div>

      <div className="jobs-layout">
        {/* Filter Panel */}
        <aside className="filter-panel card card-glass" style={{ padding: 24 }}>
          <div className="filter-section">
            <h4 style={{ marginBottom: 15 }}>Filter by Field</h4>
            <div className="filter-chips">
              {FIELDS.map((f) => (
                <button key={f} className={`filter-chip ${field === f ? 'active' : ''}`} onClick={() => resetPage(setField)(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="dropdown-divider" style={{ margin: '20px 0' }} />
          <div className="filter-section">
            <label className="form-label" htmlFor="qualSelect" style={{ fontSize: '.85rem', textTransform: 'uppercase' }}>Required Qualification</label>
            <select id="qualSelect" className="form-input form-select" value={qual} onChange={(e) => resetPage(setQual)(e.target.value)} style={{ marginTop: 5 }}>
              {QUALS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div className="dropdown-divider" style={{ margin: '20px 0' }} />
          <div className="filter-section">
            <label className="form-label" htmlFor="sortSelect" style={{ fontSize: '.85rem', textTransform: 'uppercase' }}>Sort Results</label>
            <select id="sortSelect" className="form-input form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ marginTop: 5 }}>
              <option value="lastDate">Nearest Deadline</option>
              <option value="-lastDate">Furthest Deadline</option>
              <option value="jobName">Name (A-Z)</option>
              <option value="-createdAt">Recently Added</option>
            </select>
          </div>
        </aside>

        {/* Job Listings */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input type="text" placeholder="Search jobs by name, department..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span className="text-muted" style={{ fontWeight: 600 }}>Found {totalJobs} jobs</span>
            <span className="text-muted">Page {page} of {totalPages}</span>
          </div>

          {loading ? (
            <div className="job-grid">{[...Array(6)].map((_, i) => <div key={i} className="card skeleton-card skeleton" style={{ minHeight: 220 }} />)}</div>
          ) : jobs.length === 0 ? (
            <div className="card card-glass empty-state">
              <div className="empty-icon">📂</div>
              <h3>No Jobs Found</h3>
              <p className="text-muted">No vacancies matching your filters.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setField('All'); setQual('All'); }}>Clear All Filters</button>
            </div>
          ) : (
            <div className="job-grid animate-fade-in">
              {jobs.map((job) => {
                const days = daysLeft(job.lastDate);
                const urgent = days <= 7;
                return (
                  <div key={job._id} className="job-card">
                    <div>
                      <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : job.field === 'Railway' ? 'badge-success' : 'badge-info'}`}>{job.field}</span>
                      <h3 className="job-card-title" style={{ marginTop: 8 }}>{job.jobName}</h3>
                      <span className="job-card-dept">{job.department}</span>
                    </div>
                    <div className="job-card-info">
                      <div className="job-card-info-item"><Award size={16} /><span>Min: <strong>{job.qualificationRequired}</strong></span></div>
                      <div className="job-card-info-item"><Award size={16} /><span>Age: <strong>{job.minAge}-{job.maxAge} yrs</strong></span></div>
                    </div>
                    <div className="job-card-footer">
                      <span className={`job-card-deadline ${urgent ? 'urgent' : 'safe'}`}>
                        ⏰ Last: {fmtDate(job.lastDate)} {urgent && `(${days}d left)`}
                      </span>
                      {job.applyLink && (
                        <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Apply <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
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
    </div>
  );
};

export default Jobs;
