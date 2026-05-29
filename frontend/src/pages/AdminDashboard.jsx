import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, Edit3, Trash2, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

// Options
const QUALS = [
  "10th",
  "12th",
  "ITI",
  "Diploma",
  "Graduation",
  "Post Graduation",
  "PhD",
];
const FIELDS = [
  "SSC",
  "UPSC",
  "Railway",
  "Banking",
  "Defence",
  "State PSC",
  "Teaching",
  "Police",
  "IT & CS",
  "Other",
];

// Default form
const emptyForm = {
  title: "",
  department: "",
  description: "",
  qualification: "Graduation",
  min_age: 18,
  max_age: 35,
  field: "SSC",
  applyLink: "",
  last_date: "",
};

const AdminDashboard = () => {
  const { token, showToast } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // ---------------- FETCH JOBS ----------------
  const loadJobs = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/jobs?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) setJobs(data.jobs || []);
      else showToast(data.message || "Failed to load jobs", "error");
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // ---------------- FORM HANDLER ----------------
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ---------------- OPEN CREATE ----------------
  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  // ---------------- OPEN EDIT ----------------
  const openEdit = (job) => {
    setEditId(job._id);
    setForm({
      ...job,
      last_date: job.last_date ? job.last_date.split("T")[0] : "",
    });
    setOpen(true);
  };

  // ---------------- SUBMIT ----------------
  const submit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.department || !form.last_date) {
      return showToast("Fill required fields", "error");
    }

    const url = editId ? `${API}/api/jobs/${editId}` : `${API}/api/jobs`;

    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        showToast(editId ? "Updated" : "Created", "success");
        setOpen(false);
        loadJobs();
      } else {
        showToast(data.message || "Error", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  // ---------------- DELETE ----------------
  const removeJob = async (id) => {
    if (!confirm("Delete this job?")) return;

    try {
      const res = await fetch(`${API}/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        showToast("Deleted", "success");
        loadJobs();
      } else {
        showToast("Delete failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Admin Dashboard</h2>

        <button onClick={openCreate}>
          <Plus size={16} /> Create Job
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <table border="1" width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Field</th>
              <th>Qualification</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.department}</td>
                <td>{job.field}</td>
                <td>{job.qualification}</td>
                <td>
                  {job.last_date ? new Date(job.last_date).toDateString() : "-"}
                </td>

                <td>
                  <button onClick={() => openEdit(job)}>
                    <Edit3 size={14} />
                  </button>

                  <button onClick={() => removeJob(job._id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              width: 400,
              margin: "50px auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{editId ? "Edit Job" : "Create Job"}</h3>
              <button onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit}>
              <input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
              />
              <input
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
              />
              <input
                name="applyLink"
                placeholder="Apply Link"
                value={form.applyLink}
                onChange={handleChange}
              />

              <input
                type="date"
                name="last_date"
                value={form.last_date}
                onChange={handleChange}
              />

              <button type="submit">{editId ? "Update" : "Create"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
