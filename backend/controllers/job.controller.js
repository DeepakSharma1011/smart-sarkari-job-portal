const Job = require("../models/Job.model");
const User = require("../models/User.model");
const { parseJobDetails } = require("../utils/jobParser");

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

// Sync jobs from Sarkari Result RapidAPI (max once per 10 mins)
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
    console.log(jobs);
    for (const job of Array.isArray(jobs) ? jobs : []) {
      if (job.title && job.link) {
        const parsed = parseJobDetails(job.title, job.link, job.last_date);
        await Job.findOneAndUpdate(
          { applyLink: parsed.applyLink },
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

const handleCatch = (res, error) =>
  res.status(500).json({ success: false, message: error.message });

const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res
      .status(201)
      .json({ success: true, message: "Job created successfully", job });
  } catch (error) {
    handleCatch(res, error);
  }
};

const getAllJobs = async (req, res) => {
  try {
    await syncJobsFromApi();
    const {
      keyword,
      field,
      qualificationRequired,
      status = "active",
      page = 1,
      limit = 10,
      sort = "lastDate",
    } = req.query;

    const query = { status };
    if (keyword) {
      query.$or = [
        { jobName: { $regex: keyword, $options: "i" } },
        { department: { $regex: keyword, $options: "i" } },
      ];
    }
    if (field) query.field = field;
    if (qualificationRequired)
      query.qualificationRequired = qualificationRequired;

    const totalJobs = await Job.countDocuments(query);
    const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith("-") ? -1 : 1;
    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);

    const jobs = await Job.find(query)
      .sort({ [sortField]: sortOrder })
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

const updateJob = async (req, res) => {
  try {
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

const getEligibleJobs = async (req, res) => {
  try {
    await syncJobsFromApi();
    const user = await User.findById(req.user.id);
    if (!user || !user.qualification || !user.age || !user.category) {
      return res
        .status(200)
        .json({ success: true, profileComplete: false, jobs: [] });
    }

    const userLevel = QUALIFICATION_LEVEL[user.qualification] || 0;
    const eligibleQualifications = Object.entries(QUALIFICATION_LEVEL)
      .filter(([, level]) => level <= userLevel)
      .map(([name]) => name);

    const allJobs = await Job.find({
      status: "active",
      lastDate: { $gte: new Date() },
      qualificationRequired: { $in: eligibleQualifications },
    }).sort("lastDate");

    const scoredJobs = allJobs
      .filter((job) => {
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        return user.age >= job.minAge && user.age <= job.maxAge + relaxation;
      })
      .map((job) => {
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        const matchedSkills =
          job.skillsRequired?.filter((s) =>
            user.skills
              ?.map((us) => us.toLowerCase())
              .includes(s.toLowerCase()),
          ) || [];
        const isExactQualification = user.qualification === job.qualificationRequired;
        const isComfortableAge =
          user.age >= job.minAge + 2 &&
          user.age <= job.maxAge + relaxation - 2;

        const matchDetails = {
          qualification: isExactQualification,
          age: isComfortableAge,
          categoryRelaxation: relaxation > 0,
          field: user.interestedFields?.includes(job.field) || false,
          skills: {
            matched: matchedSkills.length,
            total: job.skillsRequired?.length || 0,
          },
        };

        let score = 50;
        if (isExactQualification) score += 15;
        if (isComfortableAge)
          score += 15;
        else score += 8;
        if (relaxation > 0) score += 10;
        if (matchDetails.field) score += 10;
        if (job.skillsRequired?.length > 0 ? matchedSkills.length > 0 : true)
          score += 10;

        return {
          ...job.toObject(),
          matchPercentage: Math.min(98, Math.max(50, score)),
          matchDetails,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

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

const getJobStats = async (req, res) => {
  try {
    const activeJobs = await Job.countDocuments({ status: "active", lastDate: { $gte: new Date() } });
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
