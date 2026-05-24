import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Calendar, MapPin, Award, ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FIELDS = ['All', 'SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'IT & CS', 'Other'];
const QUALIFICATIONS = ['All', '10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];

const Jobs = () => {
  const { showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedField, setSelectedField] = useState('All');
  const [selectedQual, setSelectedQual] = useState('All');
  const [sortBy, setSortBy] = useState('lastDate'); // lastDate or jobName
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Set field from query params if page loads with one
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fieldParam = params.get('field');
    if (fieldParam && FIELDS.includes(fieldParam)) {
      setSelectedField(fieldParam);
    }
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let url = `/api/jobs?page=${page}&limit=9`;
      
      if (search) {
        url += `&keyword=${encodeURIComponent(search)}`;
      }
      if (selectedField !== 'All') {
        url += `&field=${encodeURIComponent(selectedField)}`;
      }
      if (selectedQual !== 'All') {
        url += `&qualificationRequired=${encodeURIComponent(selectedQual)}`;
      }
      
      // Sort logic
      if (sortBy) {
        url += `&sort=${sortBy}`;
      }

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
      console.error(err);
      showToast('Failed to load jobs from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, selectedField, selectedQual, sortBy, page]);

  const handleFieldChange = (field) => {
    setSelectedField(field);
    setPage(1);
  };

  const handleQualChange = (e) => {
    setSelectedQual(e.target.value);
    setPage(1);
  };

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

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '70px', minHeight: '80vh' }}>
      {/* Title */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>Government Job Board</h1>
        <p className="text-muted">Real-time vacancies dynamically synced from external Sarkari Result APIs</p>
      </div>

      <div className="jobs-layout">
        {/* Left Side: Filter Panel */}
        <aside className="filter-panel card card-glass" style={{ padding: '24px' }}>
          <div className="filter-section">
            <h4 style={{ marginBottom: '15px' }}>Filter by Field</h4>
            <div className="filter-chips">
              {FIELDS.map((field) => (
                <button
                  key={field}
                  className={`filter-chip ${selectedField === field ? 'active' : ''}`}
                  onClick={() => handleFieldChange(field)}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div className="dropdown-divider" style={{ margin: '20px 0' }}></div>

          <div className="filter-section">
            <label className="form-label" htmlFor="qualSelect" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Required Qualification</label>
            <select
              id="qualSelect"
              className="form-input form-select"
              value={selectedQual}
              onChange={handleQualChange}
              style={{ marginTop: '5px' }}
            >
              {QUALIFICATIONS.map((qual) => (
                <option key={qual} value={qual}>{qual}</option>
              ))}
            </select>
          </div>

          <div className="dropdown-divider" style={{ margin: '20px 0' }}></div>

          <div className="filter-section">
            <label className="form-label" htmlFor="sortSelect" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Sort Results</label>
            <select
              id="sortSelect"
              className="form-input form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ marginTop: '5px' }}
            >
              <option value="lastDate">Nearest Deadline First</option>
              <option value="-lastDate">Furthest Deadline First</option>
              <option value="jobName">Alphabetical Name (A-Z)</option>
              <option value="-createdAt">Recently Added First</option>
            </select>
          </div>
        </aside>

        {/* Right Side: Job Listings */}
        <main>
          {/* Search Box */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search jobs by name, department, keywords..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Job Counts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span className="text-muted" style={{ fontWeight: 600 }}>
              Found {totalJobs} jobs matching criteria
            </span>
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="job-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card skeleton-card skeleton" style={{ minHeight: '220px' }}></div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State */
            <div className="card card-glass empty-state">
              <div className="empty-icon">📂</div>
              <h3>No Jobs Found</h3>
              <p className="text-muted">No vacancies matching your keywords or filter choices are currently available.</p>
              <button className="btn btn-outline" onClick={() => {
                setSearch('');
                setSelectedField('All');
                setSelectedQual('All');
              }}>
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Job Grid */
            <div className="job-grid animate-fade-in">
              {jobs.map((job) => {
                const daysLeft = getDaysRemaining(job.lastDate);
                const isUrgent = daysLeft <= 7;
                return (
                  <div key={job._id} className="job-card">
                    <div className="job-card-header">
                      <div>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : job.field === 'Railway' ? 'badge-success' : 'badge-info'}`}>
                          {job.field}
                        </span>
                        <h3 className="job-card-title" style={{ marginTop: '8px' }}>{job.jobName}</h3>
                        <span className="job-card-dept">{job.department}</span>
                      </div>
                    </div>

                    <div className="job-card-info">
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>Min Qualification: <strong>{job.qualificationRequired}</strong></span>
                      </div>
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>Age Limits: <strong>{job.minAge}-{job.maxAge} yrs</strong></span>
                      </div>
                    </div>

                    <div className="job-card-footer">
                      <span className={`job-card-deadline ${isUrgent ? 'urgent' : 'safe'}`}>
                        ⏰ Last Date: {formatDate(job.lastDate)} {isUrgent && `(${daysLeft} days remaining!)`}
                      </span>
                      {job.applyLink && (
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
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
    </div>
  );
};

export default Jobs;
