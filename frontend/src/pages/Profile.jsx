import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Award, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

// Options for qualification and social category dropdown lists
const QUALS = [
  "10th",
  "12th",
  "ITI",
  "Diploma",
  "Graduation",
  "Post Graduation",
  "PhD",
];
const CATS = ["General", "OBC", "SC", "ST", "EWS", "PwD"];
const JOB_FIELDS = [
  "SSC",
  "UPSC",
  "Railway",
  "Banking",
  "Defence",
  "State PSC",
  "Teaching",
  "Police",
  "Other",
];

const Profile = () => {
  // Grab state and helper functions from our global AuthContext
  const { user, token, updateProfileState, showToast } = useAuth();

  // --- STATE DEFINITIONS ---
  const [loading, setLoading] = useState(true); // Loading skeleton state
  const [saving, setSaving] = useState(false); // Disable save button during submit
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    qualification: "Graduation",
    category: "General",
  });
  const [skills, setSkills] = useState([]); // List of user's skills
  const [skillInput, setSkillInput] = useState(""); // Text input for adding a new skill
  const [fields, setFields] = useState([]); // Selected interested fields array

  // --- FETCH USER PROFILE DATA ---
  // Runs once when the page loads to fetch user details from the database
  useEffect(() => {
    // If the authentication token is not yet ready, wait
    if (!token) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Call backend API
        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          const profileUser = data.user;
          // Set state variables with loaded profile values or default fallbacks
          setForm({
            name: profileUser.name || "",
            email: profileUser.email || "",
            phone: profileUser.phone || "",
            age: profileUser.age || "",
            qualification: profileUser.qualification || "Graduation",
            category: profileUser.category || "General",
          });
          setSkills(profileUser.skills || []);
          setFields(profileUser.interestedFields || []);
        } else {
          showToast(data.message || "Error loading profile", "error");
        }
      } catch (err) {
        showToast("Network error loading profile", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // --- INPUT CHANGES HANDLER ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- ADD SKILL ---
  const addSkill = (e) => {
    if ((e.key === "Enter" || e.type === "click") && skillInput.trim()) {
      e.preventDefault();
      const val = skillInput.trim();
      if (!skills.includes(val)) setSkills([...skills, val]);
      setSkillInput("");
    }
  };

  // --- TOGGLE INTERESTED FIELD ---
  const toggleField = (val) => {
    setFields(
      fields.includes(val) ? fields.filter((x) => x !== val) : [...fields, val],
    );
  };

  // --- PROFILE COMPLETENESS SCORE ---
  const calculateCompleteness = () => {
    const fieldsToCount = [
      form.name,
      form.email,
      form.phone,
      form.age,
      form.qualification,
      form.category,
    ];
    const filled = fieldsToCount.filter(Boolean).length;
    const baseScore = Math.round((filled / 6) * 90);
    return Math.min(
      100,
      baseScore + (skills.length ? 5 : 0) + (fields.length ? 5 : 0),
    );
  };

  const completenessScore = calculateCompleteness();

  // --- SUBMIT PROFILE CHANGES ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age)
      return showToast("Name and Age are required", "error");

    const parsedAge = parseInt(form.age, 10);
    if (isNaN(parsedAge) || parsedAge < 15 || parsedAge > 65) {
      return showToast("Age must be between 15 and 65 years", "error");
    }

    try {
      setSaving(true);
      const res = await (
        await fetch(`${API_URL}/api/user/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            age: parsedAge,
            skills,
            interestedFields: fields,
          }),
        })
      ).json();

      if (res.success) {
        showToast("Profile saved successfully!", "success");
        updateProfileState(res.user);
      } else showToast(res.message || "Save failed", "error");
    } catch (err) {
      showToast("Network error saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="container"
      style={{ paddingTop: 100, paddingBottom: 70, minHeight: "85vh" }}
    >
      {/* Title */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: 10 }}>
          Profile Settings
        </h1>
        <p className="text-muted">
          Fill in your details to get personalized job matches
        </p>
      </div>

      {loading ? (
        // Skeleton visual while loading
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 }}
        >
          <div
            className="card skeleton skeleton-card"
            style={{ height: 250 }}
          />
          <div
            className="card skeleton skeleton-card"
            style={{ height: 550 }}
          />
        </div>
      ) : (
        <div className="profile-grid animate-fade-in">
          {/* LEFT COLUMN: User Card & Profile Score */}
          <aside>
            <div
              className="card card-glass"
              style={{
                padding: 26,
                textAlign: "center",
                position: "sticky",
                top: 92,
              }}
            >
              <div className="profile-avatar-large">
                {form.name ? form.name[0].toUpperCase() : "U"}
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {form.name}
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: ".82rem", marginBottom: 20 }}
              >
                {form.email}
              </p>

              <div style={{ textAlign: "left", marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: ".8rem",
                    fontWeight: 600,
                    marginBottom: 5,
                  }}
                >
                  <span>Completeness</span>
                  <span>{completenessScore}%</span>
                </div>

                {/* Visual Progress bar */}
                <div className="progress-ring">
                  <div
                    className="progress-ring-fill"
                    style={{ width: `${completenessScore}%` }}
                  />
                </div>
              </div>

              <p
                style={{
                  fontSize: ".78rem",
                  lineHeight: 1.5,
                  color:
                    completenessScore === 100
                      ? "var(--success)"
                      : "var(--text-secondary)",
                }}
              >
                {completenessScore === 100
                  ? "🎉 Profile complete! Matching is active!"
                  : "💡 Complete all details for accurate recommendations."}
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN: Account Forms */}
          <main>
            <div className="card shadow-sm" style={{ padding: 35 }}>
              <form onSubmit={handleSubmit}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <User size={20} className="logo-accent" /> Account Info
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      value={form.email}
                      disabled
                      style={{
                        background: "var(--surface-alt)",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-input"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="age">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      className="form-input"
                      min="15"
                      max="65"
                      value={form.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div
                  className="dropdown-divider"
                  style={{ margin: "24px 0" }}
                />

                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Award size={20} className="logo-accent" /> Eligibility
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="qualification">
                      Qualification *
                    </label>
                    <select
                      id="qualification"
                      name="qualification"
                      className="form-input form-select"
                      value={form.qualification}
                      onChange={handleChange}
                      required
                    >
                      {QUALS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="form-input form-select"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      {CATS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="form-group">
                  <label className="form-label">
                    Skills (press Enter to add)
                  </label>
                  <div className="chips-container">
                    {skills.map((s, i) => (
                      <span key={i} className="chip">
                        {s}
                        <X
                          size={12}
                          className="chip-remove"
                          onClick={() =>
                            setSkills(skills.filter((x) => x !== s))
                          }
                        />
                      </span>
                    ))}
                    <input
                      type="text"
                      className="chip-input"
                      placeholder={
                        skills.length === 0 ? "e.g. Reasoning, Typing..." : ""
                      }
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                    />
                  </div>
                </div>

                {/* Interested Fields Selection Buttons */}
                <div className="form-group" style={{ marginBottom: 35 }}>
                  <label className="form-label">Interested Fields</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    {JOB_FIELDS.map((f) => {
                      const isSelected = fields.includes(f);

                      return (
                        <div
                          key={f}
                          onClick={() => toggleField(f)}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "1.5px solid",
                            borderColor: isSelected
                              ? "var(--primary-light)"
                              : "var(--border)",
                            background: isSelected
                              ? "var(--primary-bg)"
                              : "var(--surface)",
                            textAlign: "center",
                            fontWeight: 600,
                            fontSize: ".85rem",
                            cursor: "pointer",
                            color: isSelected
                              ? "var(--primary-light)"
                              : "var(--text-secondary)",
                            transition: "all .15s ease",
                          }}
                        >
                          {f}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    display: "flex",
                    marginLeft: "auto",
                    padding: "14px 34px",
                  }}
                  disabled={saving}
                >
                  {saving ? <span className="spinner" /> : "Save Changes"}
                </button>
              </form>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Profile;
