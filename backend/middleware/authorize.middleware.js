const CustomError = require('../utils/CustomError');

/**
 * Role-based authorization middleware.
 * Checks if the authenticated user has the required role(s).
 *
 * Usage: authorize('admin') or authorize('admin', 'moderator')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new CustomError('Not authorized. Please log in first.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          `Role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
