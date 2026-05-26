const Job = require('../models/Job.model');
const User = require('../models/User.model');
const { parseJobDetails } = require('../utils/jobParser');

// Educational levels hierarchy for qualification matching
const QUALIFICATION_LEVEL = {
  '10th': 1, '12th': 2, 'ITI': 2, 'Diploma': 3,
  'Graduation': 4, 'Post Graduation': 5, 'PhD': 6
};

let lastSyncTime = 0;

/**
 * Sync jobs from Sarkari Result RapidAPI (Maximum once every 10 minutes)
 */
const syncJobsFromApi = async () => {
  if (await Job.countDocuments() > 0 && (Date.now() - lastSyncTime < 10 * 60 * 1000)) return;

  console.log('Syncing jobs from external Sarkari Result API...');
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
          await Job.findOneAndUpdate({ applyLink: parsedJob.applyLink }, { $set: parsedJob }, { upsert: true });
        }
      }
      lastSyncTime = Date.now();
    }
  } catch (error) {
    console.error('API sync error:', error.message);
  }
};

/**
 * Create a new job listing (Admin only)
 */
const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json({ success: true, message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all job listings with Search, Filters, Sorting, and Pagination
 */
const getAllJobs = async (req, res) => {
  try {
    await syncJobsFromApi();

    // 1. Build Query Object
    const query = {};
    if (req.query.keyword) {
      query.$or = [
        { jobName: { $regex: req.query.keyword, $options: 'i' } },
        { department: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    if (req.query.field) query.field = req.query.field;
    if (req.query.qualificationRequired) query.qualificationRequired = req.query.qualificationRequired;
    query.status = req.query.status || 'active';

    // 2. Total Count
    const totalJobs = await Job.countDocuments(query);

    // 3. Sorting (Dynamic parse sort fields e.g. "lastDate" or "-lastDate")
    const sortField = req.query.sort || 'lastDate';
    const sortOptions = {};
    if (sortField.startsWith('-')) {
      sortOptions[sortField.substring(1)] = -1;
    } else {
      sortOptions[sortField] = 1;
    }

    // 4. Pagination Setup
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // 5. Fetch from Database
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      page,
      totalPages: Math.ceil(totalJobs / limit),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a single job by ID
 */
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update a job listing (Admin only)
 */
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a job listing (Admin only)
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Smart Job Recommendation Engine (Matches User Qualifications, Age, and Skills)
 */
const getEligibleJobs = async (req, res) => {
  try {
    await syncJobsFromApi();
    const user = await User.findById(req.user.id);

    // If profile is incomplete, return empty
    if (!user || !user.qualification || !user.age || !user.category) {
      return res.status(200).json({ success: true, profileComplete: false, jobs: [] });
    }

    // Step 1: Filter jobs by Qualification Level (can apply if job requires <= user education)
    const userLevel = QUALIFICATION_LEVEL[user.qualification] || 0;
    const eligibleQualifications = Object.entries(QUALIFICATION_LEVEL)
      .filter(([, level]) => level <= userLevel)
      .map(([name]) => name);

    const allJobs = await Job.find({
      status: 'active',
      lastDate: { $gte: new Date() },
      qualificationRequired: { $in: eligibleQualifications },
    }).sort('lastDate');

    // Step 2: Filter by Age Limits & Calculate Match Score Percentage
    const scoredJobs = allJobs
      .filter((job) => {
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        return user.age >= job.minAge && user.age <= (job.maxAge + relaxation);
      })
      .map((job) => {
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        const matchedSkills = job.skillsRequired?.filter(s => user.skills?.map(us => us.toLowerCase()).includes(s.toLowerCase())) || [];

        // Build checklist details for frontend
        const matchDetails = {
          qualification: true,
          age: true,
          categoryRelaxation: relaxation > 0,
          field: user.interestedFields?.includes(job.field) || false,
          skills: { matched: matchedSkills.length, total: job.skillsRequired?.length || 0 }
        };

        // Score Calculation (Base 50% + dynamic matches)
        let score = 50;
        if (user.qualification === job.qualificationRequired) score += 15;
        if (user.age >= job.minAge + 2 && user.age <= (job.maxAge + relaxation) - 2) score += 15; else score += 8;
        if (relaxation > 0) score += 10;
        if (matchDetails.field) score += 10;
        if (job.skillsRequired?.length > 0 ? matchedSkills.length > 0 : true) score += 10;

        return {
          ...job.toObject(),
          matchPercentage: Math.min(98, Math.max(50, score)),
          matchDetails
        };
      });

    // Step 3: Sort by highest score match first
    scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Step 4: Paginate recommendations
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJob, getAllJobs, getJob, updateJob, deleteJob, getEligibleJobs };
