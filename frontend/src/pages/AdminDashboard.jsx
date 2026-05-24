import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, ShieldCheck, X, FileText, ExternalLink } from 'lucide-react';

const QUALIFICATIONS = ['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];
const FIELDS = ['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'IT & CS', 'Other'];

const AdminDashboard = () => {
  const { token, showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit / Create overlay states
  const [showModal, setShowModal] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  
  const [formData, setFormData] = useState({
    jobName: '',
    department: '',
    description: '',
    qualificationRequired: 'Graduation',
    minAge: 18,
    maxAge: 35,
    field: 'SSC',
    applyLink: '',
    lastDate: '',
    categoryRelaxation: { General: 0, OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Fetch a larger page size for administrative overview
      const response = await fetch('/api/jobs?limit=50');
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        showToast(data.message || 'Error fetching admin records', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error loading admin jobs panel', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (job) => {
    setEditJobId(job._id);
    
    // Format last date string to YYYY-MM-DD
    const dateFormatted = job.lastDate ? new Date(job.lastDate).toISOString().substring(0, 10) : '';

    setFormData({
      jobName: job.jobName || '',
      department: job.department || '',
      description: job.description || '',
      qualificationRequired: job.qualificationRequired || 'Graduation',
      minAge: job.minAge || 18,
      maxAge: job.maxAge || 35,
      field: job.field || 'SSC',
      applyLink: job.applyLink || '',
      lastDate: dateFormatted,
      categoryRelaxation: job.categoryRelaxation || { General: 0, OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditJobId(null);
    setFormData({
      jobName: '',
      department: '',
      description: '',
      qualificationRequired: 'Graduation',
      minAge: 18,
      maxAge: 35,
      field: 'SSC',
      applyLink: '',
      lastDate: '',
      categoryRelaxation: { General: 0, OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jobName || !formData.department || !formData.lastDate) {
      showToast('Please fill in required fields (Name, Dept, Deadline)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const url = editJobId ? `/api/jobs/${editJobId}` : '/api/jobs';
      const method = editJobId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        showToast(editJobId ? 'Job listing updated!' : 'Job vacancy posted!', 'success');
        setShowModal(false);
        fetchJobs();
      } else {
        showToast(data.message || 'Error saving listing details', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving job profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) return;

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        showToast('Job listing deleted successfully', 'info');
        fetchJobs();
      } else {
        showToast(data.message || 'Failed to delete listing', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting job listing', 'error');
    }
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

  // Group fields counts for admin tiles
  const getFieldCounts = () => {
    const counts = { total: jobs.length };
    jobs.forEach(j => {
      counts[j.field] = (counts[j.field] || 0) + 1;
    });
    return counts;
  };

  const counts = getFieldCounts();

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '70px', minHeight: '85vh' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={32} className="logo-accent" /> Admin Dashboard
          </h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>Administrative control center for posting and maintaining government vacancies</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateClick}>
          <Plus size={18} /> Create New Job
        </button>
      </div>

      {loading ? (
        <div className="card skeleton-card skeleton" style={{ height: '350px' }}></div>
      ) : (
        <>
          {/* Admin Stats Grid */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '35px' }}>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-number" style={{ fontSize: '1.8rem' }}>{counts.total}</div>
              <div className="stat-label" style={{ fontSize: '0.75rem' }}>Total Custom & Synced</div>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-number" style={{ fontSize: '1.8rem' }}>{counts.SSC || 0}</div>
              <div className="stat-label" style={{ fontSize: '0.75rem' }}>SSC Postings</div>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-number" style={{ fontSize: '1.8rem' }}>{counts.Banking || 0}</div>
              <div className="stat-label" style={{ fontSize: '0.75rem' }}>Banking Postings</div>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-number" style={{ fontSize: '1.8rem' }}>{counts.Railway || 0}</div>
              <div className="stat-label" style={{ fontSize: '0.75rem' }}>Railway Postings</div>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-number" style={{ fontSize: '1.8rem' }}>{counts.UPSC || 0}</div>
              <div className="stat-label" style={{ fontSize: '0.75rem' }}>UPSC Postings</div>
            </div>
          </div>

          {/* Database Listings Table */}
          <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Job Postings Database</h3>
            
            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p>No job postings currently in database cache.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Department</th>
                    <th>Field</th>
                    <th>Min Qualification</th>
                    <th>Apply By</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{job.jobName}</td>
                      <td>{job.department}</td>
                      <td>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : 'badge-success'}`}>
                          {job.field}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{job.qualificationRequired}</td>
                      <td>{formatDate(job.lastDate)}</td>
                      <td style={{ width: '120px' }}>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn-outline"
                            onClick={() => handleEditClick(job)}
                            style={{ padding: '6px 8px', borderRadius: '4px' }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDeleteJob(job._id)}
                            style={{ padding: '6px 8px', borderRadius: '4px', border: 'none', background: 'var(--danger)', color: '#fff' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Add / Edit Overlay Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>{editJobId ? 'Edit Job Posting' : 'Create Custom Job Entry'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="jobName">Job Title *</label>
                  <input
                    type="text"
                    id="jobName"
                    name="jobName"
                    className="form-input"
                    value={formData.jobName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="department">Department *</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="fieldSelect">Job Field *</label>
                    <select
                      id="fieldSelect"
                      name="field"
                      className="form-input form-select"
                      value={formData.field}
                      onChange={handleChange}
                      required
                    >
                      {FIELDS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-input"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="qualSelect">Min Qualification Required *</label>
                    <select
                      id="qualSelect"
                      name="qualificationRequired"
                      className="form-input form-select"
                      value={formData.qualificationRequired}
                      onChange={handleChange}
                      required
                    >
                      {QUALIFICATIONS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastDate">Apply Deadline *</label>
                    <input
                      type="date"
                      id="lastDate"
                      name="lastDate"
                      className="form-input"
                      value={formData.lastDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="minAge">Minimum Age Limit *</label>
                    <input
                      type="number"
                      id="minAge"
                      name="minAge"
                      className="form-input"
                      value={formData.minAge}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="maxAge">Maximum Age Limit *</label>
                    <input
                      type="number"
                      id="maxAge"
                      name="maxAge"
                      className="form-input"
                      value={formData.maxAge}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="applyLink">Application link URL</label>
                  <input
                    type="url"
                    id="applyLink"
                    name="applyLink"
                    className="form-input"
                    placeholder="https://example.com/apply"
                    value={formData.applyLink}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? <span className="spinner"></span> : editJobId ? 'Save Changes' : 'Create Job Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
