const authorize = (...roles) => {
  return (req, res, next) => {


    // check login
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();

  };
};

module.exports = { authorize };
