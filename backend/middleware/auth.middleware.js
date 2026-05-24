const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const CustomError = require('../utils/CustomError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header and attaches user to request.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new CustomError('Not authorized. Please log in.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new CustomError('User not found. Token is invalid.', 401));
    }

    next();
  } catch (error) {
    return next(new CustomError('Not authorized. Token is invalid.', 401));
  }
});

module.exports = { protect };
