const Job = require('../models/Job.model');
const User = require('../models/User.model');
const ApiFeatures = require('../utils/ApiFeatures');
const { parseJobDetails } = require('../utils/jobParser');

// Qualification ranking — higher number = higher education
const QUALIFICATION_LEVEL = {
  '10th': 1, '12th': 2, 'ITI': 2, 'Diploma': 3,
  'Graduation': 4, 'Post Graduation': 5, 'PhD': 6
};

let lastSyncTime = 0;

// ─── Fetch jobs from external API (runs max once every 10 minutes) ───
const syncJobsFromApi = async () => {
  // Skip if we synced recently and already have jobs
  if (await Job.countDocuments() > 0 && Date.now() - lastSyncTime < 10 * 60 * 1000) return;

  console.log('Syncing jobs from Sarkari Result API...');
  try {
    const response = await fetch('https://sarkari-result.p.rapidapi.com/jobs/', {
      headers: {
        'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'sarkari-result.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'd14c11afaamsh2e8a15edc704762p1a8720jsn0719f0ec3910'
      }
    });
    const apiData = await response.json();
    const jobs = apiData?.data || apiData || [];

    if (Array.isArray(jobs)) {
      for (const job of jobs) {
        if (job.title && job.link) {
          const parsedJob = parseJobDetails(job.title, job.link, job.last_date);
          // Insert new job or update existing one (matched by applyLink)
          await Job.findOneAndUpdate({ applyLink: parsedJob.applyLink }, { $set: parsedJob }, { upsert: true });
        }
      }
      lastSyncTime = Date.now();
    }
  } catch (error) {
    console.error('API sync error:', error.message);
  }
};

// ─── Create a new job (Admin only) ───
const createJob = async (req, res) => {
  try {
    req.body.postedBy = req.user.id;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all jobs with search, filter, sort, pagination ───
const getAllJobs = async (req, res) => {
  try {
    await syncJobsFromApi();

    // Count total matching jobs (for pagination info)
    const countQuery = new ApiFeatures(Job.find(), req.query).search().filter();
    const totalJobs = await Job.countDocuments(countQuery.query.getFilter());

    // Get paginated results
    const features = new ApiFeatures(Job.find(), req.query).search().filter().sort().limitFields().paginate();
    const jobs = await features.query;

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      page: features.page || 1,
      totalPages: Math.ceil(totalJobs / (features.limit || 10)),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get single job by ID ───
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update a job (Admin only) ───
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete a job (Admin only) ───
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Smart Job Recommendation Engine ───
// Scores each job based on how well it matches the user's profile
const getEligibleJobs = async (req, res) => {
  try {
    await syncJobsFromApi();
    const user = await User.findById(req.user.id);

    // Check if profile is complete
    if (!user || !user.qualification || !user.age || !user.category) {
      return res.status(200).json({ success: true, profileComplete: false, jobs: [] });
    }

    // Step 1: Find jobs where user's qualification is enough
    const userLevel = QUALIFICATION_LEVEL[user.qualification] || 0;
    const qualificationsUserCanApplyFor = Object.entries(QUALIFICATION_LEVEL)
      .filter(([, level]) => level <= userLevel)
      .map(([name]) => name);

    const allJobs = await Job.find({
      status: 'active',
      lastDate: { $gte: new Date() },
      qualificationRequired: { $in: qualificationsUserCanApplyFor },
    }).sort('lastDate');

    // Step 2: Filter by age eligibility & calculate match score
    const scoredJobs = allJobs
      .filter((job) => {
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        return user.age >= job.minAge && user.age <= (job.maxAge + relaxation);
      })
      .map((job) => {
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        const jobLevel = QUALIFICATION_LEVEL[job.qualificationRequired] || 0;
        const matchDetails = { qualification: true, age: true, categoryRelaxation: false, field: false, skills: { matched: 0, total: 0 } };

        // ── Score Calculation (out of 100 points) ──

        // Base score: 25 pts (user is already eligible)
        let score = 25;

        // Qualification match: 0-20 pts (exact match = best)
        const qualGap = userLevel - jobLevel;
        if (qualGap === 0) score += 20;
        else if (qualGap === 1) score += 13;
        else if (qualGap === 2) score += 7;
        else score += Math.max(2, 20 - qualGap * 7);

        // Age fit: 0-18 pts (closer to middle of age range = better)
        const maxAge = job.maxAge + relaxation;
        const ageRange = maxAge - job.minAge;
        if (ageRange > 0) {
          const middleAge = job.minAge + ageRange / 2;
          const howFarFromMiddle = Math.abs(user.age - middleAge) / (ageRange / 2);
          score += Math.round(18 * Math.pow(Math.max(0, 1 - howFarFromMiddle), 1.3));
        } else {
          score += 18;
        }

        // Category relaxation bonus: 10 pts
        if (relaxation > 0) {
          score += 10;
          matchDetails.categoryRelaxation = true;
        }

        // Field interest match: 0-12 pts
        if (user.interestedFields?.length > 0) {
          if (user.interestedFields.includes(job.field)) {
            score += 12;
            matchDetails.field = true;
          }
        } else {
          score += 5; // no interests set = partial score
        }

        // Skills overlap: 0-10 pts
        if (job.skillsRequired?.length > 0) {
          if (user.skills?.length > 0) {
            const userSkills = user.skills.map((s) => s.toLowerCase());
            const matched = job.skillsRequired.filter((s) => userSkills.includes(s.toLowerCase()));
            score += Math.round((matched.length / job.skillsRequired.length) * 10);
            if (matched.length > 0) {
              matchDetails.skills = { matched: matched.length, total: job.skillsRequired.length };
            }
          } else {
            score += 3; // no skills set = partial score
          }
        } else {
          score += 10; // job needs no skills = full score
        }

        // Deadline urgency bonus: 0-5 pts (closer deadline = more relevant)
        const daysLeft = Math.max(0, Math.ceil((new Date(job.lastDate) - new Date()) / 86400000));
        if (daysLeft <= 5) score += 5;
        else if (daysLeft <= 10) score += 4;
        else if (daysLeft <= 20) score += 3;
        else if (daysLeft <= 30) score += 2;
        else if (daysLeft <= 60) score += 1;

        // Final percentage (clamped between 55% and 98%)
        const matchPercentage = Math.min(98, Math.max(55, score));

        return { ...job.toObject(), matchPercentage, matchDetails };
      });

    // Step 3: Sort by highest match first
    scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Step 4: Paginate results
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const paginatedJobs = scoredJobs.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      profileComplete: true,
      count: paginatedJobs.length,
      totalEligible: scoredJobs.length,
      page,
      totalPages: Math.ceil(scoredJobs.length / limit),
      jobs: paginatedJobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJob, getAllJobs, getJob, updateJob, deleteJob, getEligibleJobs };
