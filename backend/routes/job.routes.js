const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
  getEligibleJobs,
} = require('../controllers/job.controller');
const { createJobValidator, updateJobValidator } = require('../validators/job.validator');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

// GET /api/jobs/recommend/me - Must be before /:id route
router.get('/recommend/me', protect, getEligibleJobs);

// GET /api/jobs - Public
router.get('/', getAllJobs);

// GET /api/jobs/:id - Public
router.get('/:id', getJob);

// POST /api/jobs - Admin only
router.post('/', protect, authorize('admin'), createJobValidator, validate, createJob);

// PUT /api/jobs/:id - Admin only
router.put('/:id', protect, authorize('admin'), updateJobValidator, validate, updateJob);

// DELETE /api/jobs/:id - Admin only
router.delete('/:id', protect, authorize('admin'), deleteJob);

module.exports = router;
