import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, ShieldCheck, X } from 'lucide-react';

const QUALS = ['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];
const FIELDS = ['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'IT & CS', 'Other'];
const DEFAULT_FORM = { jobName: '', department: '', description: '', qualificationRequired: 'Graduation', minAge: 18, maxAge: 35, field: 'SSC', applyLink: '', lastDate: '', categoryRelaxation: { General: 0, OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 } };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

const AdminDashboard = () => {
  const { token, showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await (await fetch('/api/jobs?limit=50')).json();
      if (data.success) setJobs(data.jobs || []);
      else showToast(data.message || 'Error fetching jobs', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditId(null); setForm({ ...DEFAULT_FORM }); setShowModal(true); };

  const openEdit = (job) => {
    setEditId(job._id);
    setForm({
      jobName: job.jobName || '', department: job.department || '', description: job.description || '',
      qualificationRequired: job.qualificationRequired || 'Graduation', minAge: job.minAge || 18, maxAge: job.maxAge || 35,
      field: job.field || 'SSC', applyLink: job.applyLink || '',
      lastDate: job.lastDate ? new Date(job.lastDate).toISOString().substring(0, 10) : '',
      categoryRelaxation: job.categoryRelaxation || DEFAULT_FORM.categoryRelaxation,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobName || !form.department || !form.lastDate) return showToast('Fill required fields', 'error');
    try {
      setSubmitting(true);
      const data = await (await fetch(editId ? `/api/jobs/${editId}` : '/api/jobs', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })).json();
      if (data.success) { showToast(editId ? 'Job updated!' : 'Job posted!', 'success'); setShowModal(false); fetchJobs(); }
      else showToast(data.message || 'Error saving', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      const data = await (await fetch(`/api/jobs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })).json();
      data.success ? (showToast('Deleted', 'info'), fetchJobs()) : showToast(data.message || 'Delete failed', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  // Count jobs by field
  const counts = jobs.reduce((acc, j) => { acc[j.field] = (acc[j.field] || 0) + 1; return acc; }, { total: jobs.length });

  return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 70, minHeight: '85vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={32} className="logo-accent" /> Admin Dashboard
          </h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Control center for managing government vacancies</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Create New Job</button>
      </div>

      {loading ? (
        <div className="card skeleton-card skeleton" style={{ height: 350 }} />
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 35 }}>
            {[['Total', counts.total], ['SSC', counts.SSC || 0], ['Banking', counts.Banking || 0], ['Railway', counts.Railway || 0], ['UPSC', counts.UPSC || 0]].map(([label, num]) => (
              <div key={label} className="stat-card" style={{ padding: 16 }}>
                <div className="stat-number" style={{ fontSize: '1.8rem' }}>{num}</div>
                <div className="stat-label" style={{ fontSize: '.75rem' }}>{label} Postings</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 20 }}>Job Postings</h3>
            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--tm)' }}><p>No postings in database.</p></div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Job Name</th><th>Department</th><th>Field</th><th>Qualification</th><th>Apply By</th><th style={{ textAlign: 'center' }}>Actions</th></tr></thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td style={{ fontWeight: 600 }}>{job.jobName}</td>
                      <td>{job.department}</td>
                      <td><span className={`badge ${job.field === 'SSC' ? 'badge-primary' : job.field === 'Banking' ? 'badge-accent' : 'badge-success'}`}>{job.field}</span></td>
                      <td style={{ fontWeight: 600 }}>{job.qualificationRequired}</td>
                      <td>{fmtDate(job.lastDate)}</td>
                      <td style={{ width: 120 }}>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button className="btn-outline" onClick={() => openEdit(job)} style={{ padding: '6px 8px', borderRadius: 4 }}><Edit3 size={14} /></button>
                          <button className="btn-danger" onClick={() => deleteJob(job._id)} style={{ padding: '6px 8px', borderRadius: 4, border: 'none', background: 'var(--err)', color: '#fff' }}><Trash2 size={14} /></button>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Job' : 'Create Job'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
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
                      {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
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
                      {QUALS.map(q => <option key={q} value={q}>{q}</option>)}
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
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
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
