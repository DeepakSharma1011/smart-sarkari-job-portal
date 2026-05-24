const Job = require('../models/Job.model');
const User = require('../models/User.model');
const ApiFeatures = require('../utils/ApiFeatures');
const { parseJobDetails } = require('../utils/jobParser');

const QUALIFICATION_HIERARCHY = { '10th': 1, '12th': 2, 'ITI': 2, 'Diploma': 3, 'Graduation': 4, 'Post Graduation': 5, 'PhD': 6 };
let lastSyncTime = 0;

const syncJobsFromApi = async () => {
  if (await Job.countDocuments() > 0 && Date.now() - lastSyncTime < 10 * 60 * 1000) return;
  console.log('Syncing jobs from Sarkari Result API...');
  try {
    const res = await fetch('https://sarkari-result.p.rapidapi.com/jobs/', {
      headers: {
        'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'sarkari-result.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'd14c11afaamsh2e8a15edc704762p1a8720jsn0719f0ec3910'
      }
    });
    const apiRes = await res.json();
    const jobs = apiRes?.data || apiRes || [];
    if (Array.isArray(jobs)) {
      for (const apiJob of jobs) {
        if (apiJob.title && apiJob.link) {
          const data = parseJobDetails(apiJob.title, apiJob.link, apiJob.last_date);
          await Job.findOneAndUpdate({ applyLink: data.applyLink }, { $set: data }, { upsert: true });
        }
      }
      lastSyncTime = Date.now();
    }
  } catch (err) {
    console.error('API sync error:', err.message);
  }
};

const createJob = async (req, res) => {
  try {
    req.body.postedBy = req.user.id;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, message: 'Job created successfully', job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    await syncJobsFromApi();
    const countFeat = new ApiFeatures(Job.find(), req.query).search().filter();
    const totalJobs = await Job.countDocuments(countFeat.query.getFilter());
    const apiFeat = new ApiFeatures(Job.find(), req.query).search().filter().sort().limitFields().paginate();
    const jobs = await apiFeat.query;
    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      page: apiFeat.page || 1,
      totalPages: Math.ceil(totalJobs / (apiFeat.limit || 10)),
      jobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getEligibleJobs = async (req, res) => {
  try {
    await syncJobsFromApi();
    const user = await User.findById(req.user.id);
    if (!user || !user.qualification || !user.age || !user.category) {
      return res.status(200).json({ success: true, profileComplete: false, jobs: [] });
    }

    const userQualLevel = QUALIFICATION_HIERARCHY[user.qualification] || 0;
    const eligibleQualifications = Object.entries(QUALIFICATION_HIERARCHY)
      .filter(([, level]) => level <= userQualLevel)
      .map(([qual]) => qual);

    let jobs = await Job.find({
      status: 'active',
      lastDate: { $gte: new Date() },
      qualificationRequired: { $in: eligibleQualifications },
    }).sort('lastDate');

    const scoredJobs = jobs
      .filter((job) => user.age >= job.minAge && user.age <= (job.maxAge + (job.categoryRelaxation?.[user.category] || 0)))
      .map((job) => {
        let score = 55; // base: qualification (30) + age (25)
        const matchDetails = { qualification: true, age: true, categoryRelaxation: false, field: false, skills: { matched: 0, total: 0 } };

        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        if (relaxation > 0) {
          score += 10;
          matchDetails.categoryRelaxation = true;
        }

        if (user.interestedFields?.includes(job.field)) {
          score += 15;
          matchDetails.field = true;
        }

        if (user.skills?.length && job.skillsRequired?.length) {
          const userSkillsLower = user.skills.map((s) => s.toLowerCase());
          const matched = job.skillsRequired.filter((s) => userSkillsLower.includes(s.toLowerCase()));
          if (matched.length > 0) {
            score += Math.round((matched.length / job.skillsRequired.length) * 20);
            matchDetails.skills = { matched: matched.length, total: job.skillsRequired.length };
          }
        }

        const maxScore = 55 + (relaxation > 0 ? 10 : 0) + (user.interestedFields?.includes(job.field) ? 15 : 0) + (job.skillsRequired?.length ? 20 : 0);
        return {
          ...job.toObject(),
          matchPercentage: Math.round((score / maxScore) * 100),
          matchDetails,
        };
      });

    const page = parseInt(req.query.page, 10) || 1, limit = parseInt(req.query.limit, 10) || 10;
    const paginatedJobs = scoredJobs.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      profileComplete: true,
      count: paginatedJobs.length,
      totalEligible: scoredJobs.length,
      page,
      totalPages: Math.ceil(scoredJobs.length / limit),
      jobs: paginatedJobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createJob, getAllJobs, getJob, updateJob, deleteJob, getEligibleJobs };
