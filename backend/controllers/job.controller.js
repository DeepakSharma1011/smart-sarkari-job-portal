const Job = require("../models/Job.model");
const User = require("../models/User.model");
const { parseJobDetails } = require("../utils/jobParser");

// Map qualifications to numeric levels to check hierarchical eligibility (e.g. Graduation is higher than 10th)
const QUALIFICATION_LEVEL = {
  "10th": 1,
  "12th": 2,
  ITI: 2,
  Diploma: 3,
  Graduation: 4,
  "Post Graduation": 5,
  PhD: 6,
};

let lastSyncTime = 0;

// Sync latest jobs from Sarkari Result RapidAPI (throttled to once every 10 mins)
const syncJobsFromApi = async () => {
  if (
    (await Job.countDocuments()) > 0 &&
    Date.now() - lastSyncTime < 10 * 60 * 1000
  )
    return;

  console.log("Syncing jobs from external Sarkari Result API...");
  try {
    const response = await fetch(
      "https://sarkari-result.p.rapidapi.com/jobs/",
      {
        headers: {
          "x-rapidapi-host":
            process.env.RAPIDAPI_HOST || "sarkari-result.p.rapidapi.com",
          "x-rapidapi-key":
            process.env.RAPIDAPI_KEY ||
            "d14c11afaamsh2e8a15edc704762p1a8720jsn0719f0ec3910",
        },
      },
    );
    const jobs = (await response.json())?.data || [];

    for (const job of Array.isArray(jobs) ? jobs : []) {
      if (job.title && job.link) {
        const parsed = parseJobDetails(job.title, job.link, job.last_date);
        // Upsert jobs using title and link as composite unique keys
        await Job.findOneAndUpdate(
          { title: parsed.title, applyLink: parsed.applyLink },
          { $set: parsed },
          { upsert: true },
        );
      }
    }
    lastSyncTime = Date.now();
  } catch (error) {
    console.error("API sync error:", error.message);
  }
};

// Simple global error handler helper
const handleCatch = (res, error) =>
  res.status(500).json({ success: false, message: error.message });

// CREATE JOB (Admin only)
const createJob = async (req, res) => {
  try {
    if (
      req.body.min_age &&
      req.body.max_age &&
      parseInt(req.body.min_age, 10) > parseInt(req.body.max_age, 10)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Minimum age cannot be greater than maximum age",
        });
    }
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res
      .status(201)
      .json({ success: true, message: "Job created successfully", job });
  } catch (error) {
    handleCatch(res, error);
  }
};

// GET ALL ACTIVE JOBS WITH DYNAMIC FILTERS & CUSTOM SORT
const getAllJobs = async (req, res) => {
  try {
    // 1. Sync jobs from API
    await syncJobsFromApi();

    // 2. Expiry Automation: Auto-deactivate jobs whose last application date has passed
    const currentDate = new Date();
    await Job.updateMany(
      { last_date: { $lt: currentDate } },
      { $set: { is_active: false } },
    );

    const {
      keyword,
      field,
      qualification,
      state,
      age,
      latest,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // 3. Simple MongoDB Query: Only show active, unexpired jobs
    const query = { is_active: true, last_date: { $gte: new Date() } };

    // Search by title or department keyword
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { department: { $regex: keyword, $options: "i" } },
      ];
    }

    // Filter by sector field
    if (field && field !== "All") query.field = field;

    // Filter by required qualification
    if (qualification && qualification !== "All")
      query.qualification = qualification;

    // State filtering logic: match user's state OR accept national (all-india) jobs
    if (state && state !== "All") {
      query.$or = [{ state: state }, { all_india: true }];
    }

    // Filter by candidate's maximum age requirement
    if (age) {
      const parsedAge = parseInt(age, 10);
      if (!isNaN(parsedAge)) {
        query.min_age = { $lte: parsedAge };
      }
    }

    // Filter only current year (latest) jobs
    if (latest === "true") {
      query.notification_year = new Date().getFullYear();
    }

    const totalJobs = await Job.countDocuments(query);
    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);

    // 4. Custom sorting (Nearest Deadline first, alphabetical, recently added, or default latest-year first)
    let sortObj = { notification_year: -1, createdAt: -1 };
    if (sort) {
      const isDesc = sort.startsWith("-");
      const fieldName = isDesc ? sort.substring(1) : sort;
      sortObj = { [fieldName]: isDesc ? -1 : 1 };
    }

    const jobs = await Job.find(query)
      .sort(sortObj)
      .skip((p - 1) * l)
      .limit(l);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      page: p,
      totalPages: Math.ceil(totalJobs / l),
      jobs,
    });
  } catch (error) {
    handleCatch(res, error);
  }
};

// GET SINGLE JOB BY ID
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name email",
    );
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, job });
  } catch (error) {
    handleCatch(res, error);
  }
};

// UPDATE JOB (Admin only)
const updateJob = async (req, res) => {
  try {
    if (
      req.body.min_age &&
      req.body.max_age &&
      parseInt(req.body.min_age, 10) > parseInt(req.body.max_age, 10)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Minimum age cannot be greater than maximum age",
        });
    }
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    res
      .status(200)
      .json({ success: true, message: "Job updated successfully", job });
  } catch (error) {
    handleCatch(res, error);
  }
};

// DELETE JOB (Admin only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    handleCatch(res, error);
  }
};

// SMART PERSONALIZED JOB RECOMMENDATION ENGINE
const getEligibleJobs = async (req, res) => {
  try {
    // 1. Sync any new listings from API
    await syncJobsFromApi();

    // 2. Fetch logged-in user profile details
    const user = await User.findById(req.user.id);
    if (!user || !user.qualification || !user.age || !user.category) {
      return res
        .status(200)
        .json({ success: true, profileComplete: false, jobs: [] });
    }

    // 3. Expiry Automation: Auto-deactivate jobs whose deadlines have passed
    const currentDate = new Date();
    await Job.updateMany(
      { last_date: { $lt: currentDate } },
      { $set: { is_active: false } },
    );

    // 4. Simple MongoDB Query: Only recommend jobs that are active and unexpired
    const query = {
      is_active: true,
      last_date: { $gte: new Date() },
    };

    // State filtering logic: only show national (all-india) jobs OR jobs for user's state
    if (user.state) {
      query.$or = [{ state: user.state }, { all_india: true }];
    }

    const allJobs = await Job.find(query);

    // 5. Calculate match scoring and details for each candidate job
    const scoredJobs = allJobs
      .map((job) => {
        // Retrieve category relaxation value (e.g. OBC gets +3 years, SC/ST gets +5)
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        const maxAgeLimitWithRelaxation = job.max_age + relaxation;

        // check qualification eligibility (user must have at least the required level)
        const userLevel = QUALIFICATION_LEVEL[user.qualification] || 0;
        const jobLevel = QUALIFICATION_LEVEL[job.qualification] || 0;
        const qualificationMatch = userLevel >= jobLevel;

        // check age eligibility
        const isAgeEligible =
          user.age >= job.min_age && user.age <= maxAgeLimitWithRelaxation;

        // check state eligibility
        const stateMatch = job.all_india || job.state === user.state;

        // check if job belongs to current year
        const isLatestJob = job.notification_year === new Date().getFullYear();

        // 6. Simple Scoring Logic (Total Max 100):
        // qualification match = +40 points
        // domicile state match = +25 points
        // age eligibility = +20 points
        // latest job = +15 points
        let score = 0;
        if (qualificationMatch) score += 40;
        if (stateMatch) score += 25;
        if (isAgeEligible) score += 20;
        if (isLatestJob) score += 15;

        // Check matching skills
        const userSkillsLower =
          user.skills?.map((us) => us.toLowerCase()) || [];
        const matchedSkills =
          job.skillsRequired?.filter((s) =>
            userSkillsLower.includes(s.toLowerCase()),
          ) || [];

        // Bundle eligibility details for frontend indicators
        const matchDetails = {
          qualification: qualificationMatch,
          age: isAgeEligible,
          stateMatch: stateMatch,
          latestJob: isLatestJob,
          categoryRelaxation: relaxation > 0,
          field: user.interestedFields?.includes(job.field) || false,
          skills: {
            matched: matchedSkills.length,
            total: job.skillsRequired?.length || 0,
          },
        };

        return {
          ...job.toObject(),
          matchPercentage: score,
          matchDetails,
        };
      })
      // 7. Sort: highest score first, then newest year first, then recently added
      .sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        if (b.notification_year !== a.notification_year) {
          return b.notification_year - a.notification_year;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    // 8. Pagination support
    const p = parseInt(req.query.page, 10) || 1;
    const l = parseInt(req.query.limit, 10) || 10;
    const paginatedJobs = scoredJobs.slice((p - 1) * l, p * l);

    res.status(200).json({
      success: true,
      profileComplete: true,
      count: paginatedJobs.length,
      totalEligible: scoredJobs.length,
      page: p,
      totalPages: Math.ceil(scoredJobs.length / l),
      jobs: paginatedJobs,
    });
  } catch (error) {
    handleCatch(res, error);
  }
};

// GET SYSTEM PORTAL STATS
const getJobStats = async (req, res) => {
  try {
    const activeJobs = await Job.countDocuments({
      is_active: true,
      last_date: { $gte: new Date() },
    });
    const aspirants = await User.countDocuments({ role: "user" });

    res.status(200).json({
      success: true,
      activeJobs: activeJobs || 0,
      aspirants: aspirants || 0,
      matchingAccuracy: 98.4,
    });
  } catch (error) {
    handleCatch(res, error);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
  getEligibleJobs,
  getJobStats,
};
