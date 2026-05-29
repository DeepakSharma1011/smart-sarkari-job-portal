const errorHandler = (err, req, res, next) => {

  // show error in development
  if (process.env.NODE_ENV === "development") {
    console.log(err);
  }

  // duplicate email
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate value found",
    });
  }

  // validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // jwt error
  if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;
