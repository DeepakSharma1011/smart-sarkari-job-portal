import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Jobs.css";

const API_URL = import.meta.env.VITE_API_URL || "";

// Available fields and qualifications for filter drop-downs
const FIELDS = [
  "All",
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
const QUALS = [
  "All",
  "10th",
  "12th",
  "ITI",
  "Diploma",
  "Graduation",
  "Post Graduation",
  "PhD",
];
const STATES = [
  "All",
  "Uttar Pradesh",
  "Delhi",
  "Bihar",
  "Madhya Pradesh",
  "Rajasthan",
  "Haryana",
  "Punjab",
  "Gujarat",
  "Maharashtra",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "West Bengal",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
];

// Helper to format ISO dates to "25 Oct 2025"
const formatDate = (str) =>
  str
    ? new Date(str).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

// Helper to calculate days remaining
const calculateDaysLeft = (str) => {
  if (!str) return 0;
  const diff = Math.ceil((new Date(str) - new Date()) / 86400000); // milliseconds in a day
  return diff > 0 ? diff : 0;
};

const Jobs = () => {
  const { user, showToast } = useAuth();
  const [searchParams] = useSearchParams();

  // --- STATE DEFINITIONS ---
  const [jobs, setJobs] = useState([]); // List of matching jobs fetched from backend
  const [loading, setLoading] = useState(true); // Loading spinner state
  const [search, setSearch] = useState(""); // Text search input
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Debounced search value
  const [field, setField] = useState(() => {
    // Read initial field from URL query params (e.g. /jobs?field=SSC)
    const urlField = searchParams.get("field");
    return urlField && FIELDS.includes(urlField) ? urlField : "All";
  });
  const [qual, setQual] = useState("All"); // Selected qualification filter
  const [selectedState, setSelectedState] = useState("All"); // Selected state filter
  const [selectedAge, setSelectedAge] = useState(""); // Selected age filter
  const [latestOnly, setLatestOnly] = useState(false); // Checkbox for latest jobs
  const [sortBy, setSortBy] = useState("last_date"); // Sort field (e.g. deadline or alphabetical)
  const [page, setPage] = useState(1); // Current page index for pagination
  const [totalPages, setTotalPages] = useState(1); // Total number of available pages
  const [totalJobs, setTotalJobs] = useState(0); // Total number of job records matching filters

  // --- DEBOUNCE SEARCH INPUT ---
  // Delays the API call by 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // --- FETCH JOBS FROM BACKEND ---
  // Whenever filters (search, field, qualification, sorting, or page number) change, fetch the list from backend
  const fetchJobsList = useCallback(async () => {
    try {
      setLoading(true);

      // Construct the query URL
      let url = `${API_URL}/api/jobs?page=${page}&limit=10`;
      if (debouncedSearch) {
        url += `&keyword=${encodeURIComponent(debouncedSearch)}`;
      }
      if (field !== "All") {
        url += `&field=${encodeURIComponent(field)}`;
      }
      if (qual !== "All") {
        url += `&qualification=${encodeURIComponent(qual)}`;
      }
      if (selectedState !== "All") {
        url += `&state=${encodeURIComponent(selectedState)}`;
      }
      if (selectedAge) {
        url += `&age=${encodeURIComponent(selectedAge)}`;
      }
      if (latestOnly) {
        url += `&latest=true`;
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
        showToast(data.message || "Error fetching jobs", "error");
      }
    } catch (err) {
      showToast("Failed to load jobs from the database", "error");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    field,
    qual,
    selectedState,
    selectedAge,
    latestOnly,
    sortBy,
    page,
    showToast,
  ]);

  useEffect(() => {
    fetchJobsList();
  }, [fetchJobsList]);

  return (
    <div className="container jobs-page-container">
      {/* Title Header */}
      <div className="jobs-header">
        <h1 className="jobs-title">Government Job Board</h1>
        <p className="text-muted">
          Real-time vacancies synced from Sarkari Result APIs
        </p>
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
                  className={`filter-chip ${field === f ? "active" : ""}`}
                  onClick={() => {
                    setField(f);
                    setPage(1);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="dropdown-divider jobs-divider" />

          {/* Qualification Filter */}
          <div className="filter-section">
            <label
              className="form-label jobs-filter-label"
              htmlFor="qualSelect"
            >
              Required Qualification
            </label>
            <select
              id="qualSelect"
              className="form-input form-select jobs-filter-select"
              value={qual}
              onChange={(e) => {
                setQual(e.target.value);
                setPage(1);
              }}
            >
              {QUALS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-divider jobs-divider" />

          {/* State Filter */}
          <div className="filter-section">
            <label
              className="form-label jobs-filter-label"
              htmlFor="stateSelect"
            >
              State Government Jobs
            </label>
            <select
              id="stateSelect"
              className="form-input form-select jobs-filter-select"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-divider jobs-divider" />

          {/* Age Filter */}
          <div className="filter-section">
            <label className="form-label jobs-filter-label" htmlFor="ageInput">
              Max Age Limit
            </label>
            <input
              id="ageInput"
              type="number"
              className="form-input jobs-filter-select"
              placeholder="e.g. 25"
              value={selectedAge}
              onChange={(e) => {
                setSelectedAge(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="dropdown-divider jobs-divider" />

          {/* Latest Jobs Checkbox */}
          <div
            className="filter-section"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <input
              id="latestCheck"
              type="checkbox"
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
              checked={latestOnly}
              onChange={(e) => {
                setLatestOnly(e.target.checked);
                setPage(1);
              }}
            />
            <label
              className="form-label jobs-filter-label"
              htmlFor="latestCheck"
              style={{ margin: 0, cursor: "pointer" }}
            >
              Latest 2026 Jobs Only
            </label>
          </div>

          <div className="dropdown-divider jobs-divider" />

          {/* Sort Filter */}
          <div className="filter-section">
            <label
              className="form-label jobs-filter-label"
              htmlFor="sortSelect"
            >
              Sort Results
            </label>
            <select
              id="sortSelect"
              className="form-input form-select jobs-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="last_date">Nearest Deadline</option>
              <option value="-last_date">Furthest Deadline</option>
              <option value="title">Name (A-Z)</option>
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="jobs-summary">
            <span className="text-muted jobs-summary-text">
              Found {totalJobs} jobs
            </span>
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>
          </div>

          {/* Render Job Grid */}
          {loading ? (
            // Skeleton loader shown during API load
            <div className="job-grid">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="card skeleton-card skeleton"
                  style={{ minHeight: 220 }}
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            // Empty State
            <div className="card card-glass empty-state">
              <div className="empty-icon">📂</div>
              <h3>No matching jobs found</h3>
              <p className="text-muted">No vacancies matching your filters.</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch("");
                  setField("All");
                  setQual("All");
                  setSelectedState("All");
                  setSelectedAge("");
                  setLatestOnly(false);
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            // Cards Grid
            <div className="job-grid animate-fade-in">
              {jobs.map((job) => {
                const days = calculateDaysLeft(job.last_date);
                const urgent = days <= 7;
                const isLatest2026 = job.notification_year === 2026;
                const stateText = job.state ? `${job.state} Govt` : "All India";

                // Dynamic Age Logic
                const ageText =
                  job.min_age && job.max_age
                    ? `${job.min_age}-${job.max_age} Years`
                    : "Age Data Not Available";

                return (
                  <div
                    key={job._id}
                    className="job-card"
                    style={{ position: "relative" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        className={`badge ${job.field === "SSC" ? "badge-primary" : job.field === "Banking" ? "badge-accent" : job.field === "Railway" ? "badge-success" : "badge-info"}`}
                      >
                        {job.field}
                      </span>
                      <span
                        className="badge badge-secondary"
                        style={{
                          backgroundColor: "var(--surface-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {stateText}
                      </span>
                      {isLatest2026 && (
                        <span
                          className="badge badge-success"
                          style={{
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            border: "1px solid #10b981",
                          }}
                        >
                          Latest 2026
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="job-card-title jobs-job-card-title">
                        {job.title}
                      </h3>
                      <span className="job-card-dept">{job.department}</span>
                    </div>

                    <div className="job-card-info">
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>
                          Min: <strong>{job.qualification}</strong>
                        </span>
                      </div>
                      <div className="job-card-info-item">
                        <Award size={16} />
                        <span>
                          Age: <strong>{ageText}</strong>
                          {job.categoryRelaxation?.[user?.category] > 0 && (
                            <span
                              className="text-success"
                              style={{ fontSize: "0.85em", marginLeft: "4px" }}
                            >
                              (incl. {user?.category} relaxation)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="job-card-footer">
                      <span
                        className={`job-card-deadline ${urgent ? "urgent" : "safe"}`}
                      >
                        ⏰ Last: {formatDate(job.last_date)}{" "}
                        {urgent && `(${days}d left)`}
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
                  className={`page-btn ${page === p ? "active" : ""}`}
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
