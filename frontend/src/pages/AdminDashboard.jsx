import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, ShieldCheck, X } from 'lucide-react';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '';

// Input option lists
const QUALS = ['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];
const FIELDS = ['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'IT & CS', 'Other'];

// Default template object for a new job form
const DEFAULT_FORM_VALUES = { 
  jobName: '', 
  department: '', 
  description: '', 
  qualificationRequired: 'Graduation', 
  minAge: 18, 
  maxAge: 35, 
  field: 'SSC', 
  applyLink: '', 
  lastDate: '', 
  categoryRelaxation: { 
    General: 0, 
    OBC: 3, 
    SC: 5, 
    ST: 5, 
    EWS: 0, 
    PwD: 10 
  } 
};

// Helper function: formats raw date to a user-friendly format ("25 Oct 2025")
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const AdminDashboard = () => {
  const { token, showToast } = useAuth();
  
  // --- STATE DEFINITIONS ---
  const [jobs, setJobs] = useState([]); // List of job postings from backend
  const [loading, setLoading] = useState(true); // Loading skeleton state
  const [submitting, setSubmitting] = useState(false); // Spinner state during form submit
  const [showModal, setShowModal] = useState(false); // Controls opening/closing of the Job Editor modal
  const [editId, setEditId] = useState(null); // Database ID of the job currently being edited (null = creating new job)
  const [form, setForm] = useState({ ...DEFAULT_FORM_VALUES }); // Modal Form input values

  // --- FETCH ALL JOBS ---
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/jobs?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        showToast(data.message || 'Error fetching jobs list', 'error');
      }
    } catch (err) {
      showToast('Network error loading jobs list', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // Run on component mount
  useEffect(() => { 
    fetchJobs(); 
  }, [fetchJobs]);

  // --- INPUT CHANGES ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- OPEN MODALS ---
  const openCreateModal = () => { 
    setEditId(null);
    setForm({ ...DEFAULT_FORM_VALUES });
    setShowModal(true); 
  };

  const openEditModal = (selectedJob) => {
    setEditId(selectedJob._id);
    setForm({
      ...selectedJob,
      lastDate: selectedJob.lastDate ? new Date(selectedJob.lastDate).toISOString().substring(0, 10) : ''
    });
    setShowModal(true);
  };

  // --- CREATE OR UPDATE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobName || !form.department || !form.lastDate) {
      return showToast('Please fill out all required fields (*)', 'error');
    }
    
    try {
      setSubmitting(true);
      const isEdit = !!editId;
      const url = isEdit ? `${API_URL}/api/jobs/${editId}` : `${API_URL}/api/jobs`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const res = await response.json();
      
      if (res.success) {
        showToast(isEdit ? 'Job updated!' : 'Job posted!', 'success');
        setShowModal(false);
        fetchJobs();
      } else showToast(res.message || 'Error saving job', 'error');
    } catch (err) {
      showToast('Network error saving job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- DELETE JOB ---
  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      const response = await fetch(`${API_URL}/api/jobs/${id}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const res = await response.json();
      
      if (res.success) {
        showToast('Job listing deleted', 'info');
        fetchJobs();
      } else showToast(res.message || 'Delete failed', 'error');
    } catch (err) {
      showToast('Network error during deletion', 'error');
    }
  };

  // Count existing jobs in current list by category
  const fieldCounts = { total: jobs.length };
  jobs.forEach(j => fieldCounts[j.field] = (fieldCounts[j.field] || 0) + 1);

  return (
    <div className="container admin-page-container">
      
      {/* Header section */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">
            <ShieldCheck size={32} className="logo-accent" /> Admin Dashboard
          </h1>
          <p className="text-muted admin-subtitle">Control center for managing government vacancies</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Create New Job
        </button>
      </div>

      {loading ? (
        <div className="card skeleton-card skeleton admin-skeleton-card" />
      ) : (
        <>
          {/* Quick Metrics Bar */}
          <div className="admin-metrics-grid">
            {[
              ['Total', fieldCounts.total], 
              ['SSC', fieldCounts.SSC || 0], 
              ['Banking', fieldCounts.Banking || 0], 
              ['Railway', fieldCounts.Railway || 0], 
              ['UPSC', fieldCounts.UPSC || 0]
            ].map(([labelName, totalCount]) => (
              <div key={labelName} className="stat-card admin-metric-card">
                <div className="stat-number admin-metric-number">{totalCount}</div>
                <div className="stat-label admin-metric-label">{labelName} Postings</div>
              </div>
            ))}
          </div>

          {/* Jobs Listing Table */}
          <div className="card admin-table-card">
            <h3 className="admin-table-title">Job Postings</h3>
            
            {jobs.length === 0 ? (
              <div className="admin-empty-table">
                <p>No postings in database.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Department</th>
                    <th>Field</th>
                    <th>Qualification</th>
                    <th>Apply By</th>
                    <th className="admin-th-center">Actions</th>
                  </tr>
                </thead>
                
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td className="admin-td-bold">{job.jobName}</td>
                      <td>{job.department}</td>
                      <td>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : 'badge-success'}`}>
                          {job.field}
                        </span>
                      </td>
                      <td className="admin-td-bold">{job.qualificationRequired}</td>
                      <td>{formatDate(job.lastDate)}</td>
                      
                      <td className="admin-td-actions">
                        <div className="table-actions admin-actions-container">
                          {/* Edit Button */}
                          <button 
                            className="btn-outline admin-btn-edit" 
                            onClick={() => openEditModal(job)} 
                          >
                            <Edit3 size={14} />
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            className="btn-danger admin-btn-delete" 
                            onClick={() => deleteJob(job._id)} 
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

      {/* --- FORM DIALOG MODAL --- */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal admin-modal-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Title bar */}
            <div className="modal-header">
              <h3>{editId ? 'Edit Job' : 'Create Job'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Form inputs */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body admin-modal-body">
                
                <div className="form-group">
                  <label className="form-label" htmlFor="jobName">Job Title *</label>
                  <input type="text" id="jobName" name="jobName" className="form-input" value={form.jobName} onChange={handleChange} required />
                </div>

                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="department">Department *</label>
                    <input type="text" id="department" name="department" className="form-input" value={form.department} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="fieldSelect">Field *</label>
                    <select id="fieldSelect" name="field" className="form-input form-select" value={form.field} onChange={handleChange} required>
                      {FIELDS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea id="description" name="description" className="form-input" rows="3" value={form.description} onChange={handleChange} />
                </div>

                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="qualSelect">Min Qualification *</label>
                    <select id="qualSelect" name="qualificationRequired" className="form-input form-select" value={form.qualificationRequired} onChange={handleChange} required>
                      {QUALS.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastDate">Deadline *</label>
                    <input type="date" id="lastDate" name="lastDate" className="form-input" value={form.lastDate} onChange={handleChange} required />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="minAge">Min Age *</label>
                    <input type="number" id="minAge" name="minAge" className="form-input" value={form.minAge} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="maxAge">Max Age *</label>
                    <input type="number" id="maxAge" name="maxAge" className="form-input" value={form.maxAge} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="applyLink">Application URL</label>
                  <input type="url" id="applyLink" name="applyLink" className="form-input" placeholder="https://example.com/apply" value={form.applyLink} onChange={handleChange} />
                </div>
              </div>
              
              {/* Modal footer containing submit/cancel actions */}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : editId ? 'Save Changes' : 'Create Job'}
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
