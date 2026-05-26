import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, ShieldCheck, X } from 'lucide-react';

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
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/jobs?limit=50`);
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
  };

  // Run on component mount
  useEffect(() => { 
    fetchJobs(); 
  }, []);

  // --- INPUT CHANGES HANDLER ---
  const handleChange = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setForm({ 
      ...form, 
      [fieldName]: fieldValue 
    });
  };

  // --- OPEN CREATION MODAL ---
  const openCreateModal = () => { 
    setEditId(null); // Null signifies we are writing a new entry, not editing an existing one
    setForm({ ...DEFAULT_FORM_VALUES }); // Reset form to blank template
    setShowModal(true); 
  };

  // --- OPEN EDIT MODAL ---
  const openEditModal = (selectedJob) => {
    setEditId(selectedJob._id); // Save current job ID in state
    
    // Map existing job database fields to form state
    setForm({
      jobName: selectedJob.jobName || '', 
      department: selectedJob.department || '', 
      description: selectedJob.description || '',
      qualificationRequired: selectedJob.qualificationRequired || 'Graduation', 
      minAge: selectedJob.minAge || 18, 
      maxAge: selectedJob.maxAge || 35,
      field: selectedJob.field || 'SSC', 
      applyLink: selectedJob.applyLink || '',
      // Extract first 10 characters (YYYY-MM-DD) from date ISO string for date inputs
      lastDate: selectedJob.lastDate ? new Date(selectedJob.lastDate).toISOString().substring(0, 10) : '',
      categoryRelaxation: selectedJob.categoryRelaxation || DEFAULT_FORM_VALUES.categoryRelaxation,
    });
    
    setShowModal(true);
  };

  // --- CREATE OR UPDATE FORM SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.jobName || !form.department || !form.lastDate) {
      return showToast('Please fill out all required fields (*)', 'error');
    }
    
    try {
      setSubmitting(true);
      
      // Determine request path and method based on edit vs create
      let url = `${API_URL}/api/jobs`;
      let requestMethod = 'POST';
      
      if (editId) {
        url = `${API_URL}/api/jobs/${editId}`;
        requestMethod = 'PUT';
      }

      const response = await fetch(url, {
        method: requestMethod,
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      
      if (data.success) {
        if (editId) {
          showToast('Job listing updated successfully!', 'success');
        } else {
          showToast('New job vacancy posted successfully!', 'success');
        }
        setShowModal(false); // Close popup modal
        fetchJobs(); // Re-load latest job listings
      } else {
        showToast(data.message || 'Error saving job data', 'error');
      }
    } catch (err) {
      showToast('Network error saving job posting', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- DELETE JOB POSTING ---
  const deleteJob = async (id) => {
    // Confirm with user before proceeding
    const confirmed = window.confirm('Are you sure you want to delete this job listing?');
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${API_URL}/api/jobs/${id}`, { 
        method: 'DELETE', 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('Job listing deleted successfully', 'info');
        fetchJobs(); // Reload updated list
      } else {
        showToast(data.message || 'Delete operation failed', 'error');
      }
    } catch (err) {
      showToast('Network error during deletion', 'error');
    }
  };

  // Count existing jobs in current list by category fields
  const fieldCounts = jobs.reduce((accumulator, currentJob) => { 
    const currentField = currentJob.field;
    accumulator[currentField] = (accumulator[currentField] || 0) + 1; 
    return accumulator; 
  }, { total: jobs.length });

  return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 70, minHeight: '85vh' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={32} className="logo-accent" /> Admin Dashboard
          </h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Control center for managing government vacancies</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Create New Job
        </button>
      </div>

      {loading ? (
        <div className="card skeleton-card skeleton" style={{ height: 350 }} />
      ) : (
        <>
          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 35 }}>
            {[
              ['Total', fieldCounts.total], 
              ['SSC', fieldCounts.SSC || 0], 
              ['Banking', fieldCounts.Banking || 0], 
              ['Railway', fieldCounts.Railway || 0], 
              ['UPSC', fieldCounts.UPSC || 0]
            ].map(([labelName, totalCount]) => (
              <div key={labelName} className="stat-card" style={{ padding: 16 }}>
                <div className="stat-number" style={{ fontSize: '1.8rem' }}>{totalCount}</div>
                <div className="stat-label" style={{ fontSize: '.75rem' }}>{labelName} Postings</div>
              </div>
            ))}
          </div>

          {/* Jobs Listing Table */}
          <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 20 }}>Job Postings</h3>
            
            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
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
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td style={{ fontWeight: 600 }}>{job.jobName}</td>
                      <td>{job.department}</td>
                      <td>
                        <span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : 'badge-success'}`}>
                          {job.field}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{job.qualificationRequired}</td>
                      <td>{formatDate(job.lastDate)}</td>
                      
                      <td style={{ width: 120 }}>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          {/* Edit Button */}
                          <button 
                            className="btn-outline" 
                            onClick={() => openEditModal(job)} 
                            style={{ padding: '6px 8px', borderRadius: 4 }}
                          >
                            <Edit3 size={14} />
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            className="btn-danger" 
                            onClick={() => deleteJob(job._id)} 
                            style={{ padding: '6px 8px', borderRadius: 4, border: 'none', background: 'var(--danger)', color: '#fff' }}
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
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            
            {/* Modal Title bar */}
            <div className="modal-header">
              <h3>{editId ? 'Edit Job' : 'Create Job'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Form inputs */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="jobName">Job Title *</label>
                  <input type="text" id="jobName" name="jobName" className="form-input" value={form.jobName} onChange={handleChange} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
