import { useState, useEffect } from 'react';
import { Search, Award, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Jobs.css';

const API_URL = import.meta.env.VITE_API_URL || '';

// Available fields and qualifications for filter drop-downs
const FIELDS = ['All', 'SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'IT & CS', 'Other'];
const QUALS = ['All', '10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];

// Helper to format ISO dates to "25 Oct 2025"
const formatDate = (str) => 
  str ? new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

// Helper to calculate days remaining
const calculateDaysLeft = (str) => {
  if (!str) return 0;
  const diff = Math.ceil((new Date(str) - new Date()) / (86400000)); // milliseconds in a day
  return diff > 0 ? diff : 0;
};

const Jobs = () => {
  const { showToast } = useAuth();
  
  // --- STATE DEFINITIONS ---
  const [jobs, setJobs] = useState([]); // List of matching jobs fetched from backend
  const [loading, setLoading] = useState(true); // Loading spinner state
  const [search, setSearch] = useState(''); // Text search input
  const [field, setField] = useState('All'); // Selected industry field filter
  const [qual, setQual] = useState('All'); // Selected qualification filter
  const [sortBy, setSortBy] = useState('lastDate'); // Sort field (e.g. deadline or alphabetical)
  const [page, setPage] = useState(1); // Current page index for pagination
  const [totalPages, setTotalPages] = useState(1); // Total number of available pages
  const [totalJobs, setTotalJobs] = useState(0); // Total number of job records matching filters

  // --- READ INITIAL FILTERS FROM URL ---
  // When a user lands on the page (e.g. clicked /jobs?field=SSC from home), set the initial filter state
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlField = queryParams.get('field');
    
    if (urlField && FIELDS.includes(urlField)) {
      setField(urlField);
    }
  }, []);

  // --- FETCH JOBS FROM BACKEND ---
  // Whenever filters (search, field, qualification, sorting, or page number) change, fetch the list from backend
  useEffect(() => {
    const fetchJobsList = async () => {
      try {
        setLoading(true);
        
        // Construct the query URL
        let url = `${API_URL}/api/jobs?page=${page}&limit=9`;
        if (search) {
          url += `&keyword=${encodeURIComponent(search)}`;
        }
        if (field !== 'All') {
          url += `&field=${encodeURIComponent(field)}`;
        }
        if (qual !== 'All') {
          url += `&qualificationRequired=${encodeURIComponent(qual)}`;
        }
        if (sortBy) {
          url += `&sort=${sortBy}`;
        }

        // Fetch the raw response and convert to JSON
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setJobs(data.jobs);
          setTotalPages(data.totalPages);
          setTotalJobs(data.totalJobs);
        } else {
          showToast(data.message || 'Error fetching jobs', 'error');
        }
      } catch (err) {
        showToast('Failed to load jobs from the database', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchJobsList();
  }, [search, field, qual, sortBy, page]);

  return (
    <div className="container jobs-page-container">
      
      {/* Title Header */}
      <div className="jobs-header">
        <h1 className="jobs-title">Government Job Board</h1>
        <p className="text-muted">Real-time vacancies synced from Sarkari Result APIs</p>
      </div>

      <div className="jobs-layout">
        
        {/* --- LEFT PANEL: FILTERS --- */}
        <aside className="filter-panel card card-glass jobs-filter-panel">
          {/* Field Category Filter */}
          <div className="filter-section">
            <h4 className="jobs-filter-title">Filter by Field</h4>
            <div className="filter-chips">
              {FIELDS.map((f) => (
                <button 
                  key={f} 
                  className={`filter-chip ${field === f ? 'active' : ''}`} 
                  onClick={() => { setField(f); setPage(1); }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div className="dropdown-divider jobs-divider" />
          
          {/* Qualification Filter */}
          <div className="filter-section">
            <label className="form-label jobs-filter-label" htmlFor="qualSelect">
              Required Qualification
            </label>
            <select 
              id="qualSelect" 
              className="form-input form-select jobs-filter-select" 
              value={qual} 
              onChange={(e) => { setQual(e.target.value); setPage(1); }} 
            >
              {QUALS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          
          <div className="dropdown-divider jobs-divider" />
          
          {/* Sort Filter */}
          <div className="filter-section">
            <label className="form-label jobs-filter-label" htmlFor="sortSelect">
              Sort Results
            </label>
            <select 
              id="sortSelect" 
              className="form-input form-select jobs-filter-select" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
            >
              <option value="lastDate">Nearest Deadline</option>
              <option value="-lastDate">Furthest Deadline</option>
              <option value="jobName">Name (A-Z)</option>
              <option value="-createdAt">Recently Added</option>
            </select>
          </div>
        </aside>

        {/* --- RIGHT CONTENT: JOB LIST --- */}
        <main>
          {/* Search Bar Input */}
          <div className="jobs-search-container">
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search jobs by name, department..." 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              />
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="jobs-summary">
            <span className="text-muted jobs-summary-text">Found {totalJobs} jobs</span>
            <span className="text-muted">Page {page} of {totalPages}</span>
          </div>

          {/* Render Job Grid */}
          {loading ? (
            // Skeleton loader shown during API load
            <div className="job-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card skeleton-card skeleton" style={{ minHeight: 220 }} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            // Empty State
            <div className="card card-glass empty-state">
              <div className="empty-icon">📂</div>
              <h3>No Jobs Found</h3>
              <p className="text-muted">No vacancies matching your filters.</p>
              <button 
                className="btn btn-outline" 
                onClick={() => { setSearch(''); setField('All'); setQual('All'); }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            // Cards Grid
            <div className="job-grid animate-fade-in">
              {jobs.map((job) => {
                const days = calculateDaysLeft(job.lastDate);
                const urgent = (days <= 7); // Highlight warning color if <= 7 days remaining
                
                return (
                  <div key={job._id} className="job-card">
                    <div>
                      <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : job.field === 'Railway' ? 'badge-success' : 'badge-info'}`}>
                        {job.field}
                      </span>
                      <h3 className="job-card-title jobs-job-card-title">{job.jobName}</h3>
                      <span className="job-card-dept">{job.department}</span>
                    </div>
                    
                    <div className="job-card-info">
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>Min: <strong>{job.qualificationRequired}</strong></span>
                      </div>
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>Age: <strong>{job.minAge}-{job.maxAge} yrs</strong></span>
                      </div>
                    </div>
                    
                    <div className="job-card-footer">
                      <span className={`job-card-deadline ${urgent ? 'urgent' : 'safe'}`}>
                        ⏰ Last: {formatDate(job.lastDate)} {urgent && `(${days}d left)`}
                      </span>
                      {job.applyLink && (
                        <a 
                          href={job.applyLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-outline btn-sm jobs-apply-btn"
                        >
                          Apply <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              {/* Back Button */}
              <button 
                className="page-btn" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button 
                  key={p} 
                  className={`page-btn ${page === p ? 'active' : ''}`} 
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              
              {/* Next Button */}
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
    </div>
  );
};

export default Jobs;
