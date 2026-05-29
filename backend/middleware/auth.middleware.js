const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

/* ========= PROTECT ROUTE ========= */
const protect = async (req, res, next) => {
  try {

    let token;

    // get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // no token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // attach user
    req.user = user;

    next();


  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = { protect };
