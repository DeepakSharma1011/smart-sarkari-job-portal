const Job = require('../models/Job.model');
const User = require('../models/User.model');
const { parseJobDetails } = require('../utils/jobParser');

// Educational ranking — used to check if user's education is enough for a job
const QUALIFICATION_LEVEL = {
  '10th': 1,
  '12th': 2,
  'ITI': 2,
  'Diploma': 3,
  'Graduation': 4,
  'Post Graduation': 5,
  'PhD': 6
};

// Variable to keep track of the last time we synced with the external API
let lastSyncTime = 0;

/**
 * Helper function to fetch latest government jobs from external RapidAPI
 * and save them to our MongoDB database. Runs maximum once every 10 minutes.
 */
const syncJobsFromApi = async () => {
  // If we already have jobs in the database and synced less than 10 minutes ago, skip it
  const jobCount = await Job.countDocuments();
  if (jobCount > 0 && (Date.now() - lastSyncTime < 10 * 60 * 1000)) {
    return;
  }

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
          // Parse the raw job details using our jobParser utility
          const parsedJob = parseJobDetails(job.title, job.link, job.last_date);

          // Save the parsed job to database. If it already exists (matched by applyLink), update it.
          await Job.findOneAndUpdate(
            { applyLink: parsedJob.applyLink },
            { $set: parsedJob },
            { upsert: true }
          );
        }
      }
      lastSyncTime = Date.now();
      console.log('✅ Sarkari Result API Sync complete.');
    }
  } catch (error) {
    console.error('API sync error:', error.message);
  }
};

/**
 * POST /api/jobs
 * Create a new job manually (Admin only)
 */
const createJob = async (req, res) => {
  try {
    // Attach the ID of the admin who created the job
    req.body.postedBy = req.user.id;
    const job = await Job.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/jobs
 * Get all jobs from database with search, filter, sort, and pagination.
 */
const getAllJobs = async (req, res) => {
  try {
    // Auto-sync latest jobs from external API before listing
    await syncJobsFromApi();

    // 1. Build Mongoose search/filter query
    const query = {};

    // Filter by search keyword (checks jobName or department)
    if (req.query.keyword) {
      query.$or = [
        { jobName: { $regex: req.query.keyword, $options: 'i' } },
        { department: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    // Filter by sector/field (e.g. Banking, Railway)
    if (req.query.field) {
      query.field = req.query.field;
    }

    // Filter by minimum required qualification
    if (req.query.qualificationRequired) {
      query.qualificationRequired = req.query.qualificationRequired;
    }

    // Filter by active/expired status (Default is active)
    if (!req.query.status) {
      query.status = 'active';
    } else {
      query.status = req.query.status;
    }

    // 2. Count total matching jobs in database (needed for pagination count)
    const totalJobs = await Job.countDocuments(query);

    // 3. Set sorting options
    let sortOptions = { lastDate: 1 }; // Default: Soonest deadline first
    if (req.query.sort) {
      if (req.query.sort === 'lastDate') sortOptions = { lastDate: 1 };
      else if (req.query.sort === '-lastDate') sortOptions = { lastDate: -1 };
      else if (req.query.sort === 'createdAt') sortOptions = { createdAt: 1 };
      else if (req.query.sort === '-createdAt') sortOptions = { createdAt: -1 };
    }

    // 4. Setup page & limit pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skipIndex = (page - 1) * limit;

    // 5. Fetch jobs from DB with filters, sorting, and pagination
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skipIndex)
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
 * GET /api/jobs/:id
 * Get single job details by ID
 */
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/jobs/:id
 * Update job details by ID (Admin only)
 */
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/jobs/:id
 * Delete job by ID (Admin only)
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/jobs/recommend/me
 * Smart Job Recommendation Engine.
 * Matches jobs to the logged-in user based on qualification, age, and interests.
 */
const getEligibleJobs = async (req, res) => {
  try {
    // Auto-sync latest jobs from API
    await syncJobsFromApi();

    // Get logged-in user profile
    const user = await User.findById(req.user.id);

    // If user profile is not complete, return empty list
    if (!user || !user.qualification || !user.age || !user.category) {
      return res.status(200).json({
        success: true,
        profileComplete: false,
        jobs: []
      });
    }

    // Step 1: Find jobs where user's qualification level is enough
    const userLevel = QUALIFICATION_LEVEL[user.qualification] || 0;
    
    // Get all qualifications that user can apply for (i.e. <= user's qualification level)
    const qualificationsUserCanApplyFor = Object.entries(QUALIFICATION_LEVEL)
      .filter(([, level]) => level <= userLevel)
      .map(([name]) => name);

    // Find active jobs matching the qualifications
    const allJobs = await Job.find({
      status: 'active',
      lastDate: { $gte: new Date() },
      qualificationRequired: { $in: qualificationsUserCanApplyFor },
    }).sort('lastDate');

    // Step 2: Filter by age eligibility & calculate match score percentage
    const scoredJobs = allJobs
      .filter((job) => {
        // Calculate max age with user's category relaxation (OBC = 3, SC/ST = 5, PwD = 10 years, etc.)
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        return user.age >= job.minAge && user.age <= (job.maxAge + relaxation);
      })
      .map((job) => {
        const relaxation = job.categoryRelaxation?.[user.category] || 0;
        
        // Setup match details checklist for the frontend
        const matchDetails = {
          qualification: true,
          age: true,
          categoryRelaxation: false,
          field: false,
          skills: { matched: 0, total: 0 }
        };

        // ── Simple Match Score Calculation (out of 100%) ──
        let score = 50; // Base score (the user is already eligible)

        // 1. Qualification Match: +15% if it's an exact match
        if (user.qualification === job.qualificationRequired) {
          score += 15;
        }

        // 2. Age Range Match: +15% if user's age is comfortably within the limits (with category relaxation)
        const maxAgeWithRelaxation = job.maxAge + relaxation;
        if (user.age >= job.minAge + 2 && user.age <= maxAgeWithRelaxation - 2) {
          score += 15;
        } else {
          score += 8; // Close to the age boundaries gets partial points
        }

        // 3. Category Relaxation Bonus: +10% if user is getting relaxation benefit
        if (relaxation > 0) {
          score += 10;
          matchDetails.categoryRelaxation = true;
        }

        // 4. Interested Fields Match: +10%
        if (user.interestedFields && user.interestedFields.includes(job.field)) {
          score += 10;
          matchDetails.field = true;
        }

        // 5. Skills Match: +10%
        if (job.skillsRequired && job.skillsRequired.length > 0) {
          if (user.skills && user.skills.length > 0) {
            const userSkills = user.skills.map((s) => s.toLowerCase());
            const matchedSkills = job.skillsRequired.filter((s) => userSkills.includes(s.toLowerCase()));
            
            if (matchedSkills.length > 0) {
              score += 10;
              matchDetails.skills = { matched: matchedSkills.length, total: job.skillsRequired.length };
            }
          }
        } else {
          score += 10; // If no specific skills are required, full points
        }

        // Clamp match percentage between 50% and 98%
        const matchPercentage = Math.min(98, Math.max(50, score));

        return { ...job.toObject(), matchPercentage, matchDetails };
      });

    // Step 3: Sort by highest match percentage first
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
