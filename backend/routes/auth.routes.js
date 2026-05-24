const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', registerValidator, validate, registerUser);

// POST /api/auth/login
router.post('/login', loginValidator, validate, loginUser);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
