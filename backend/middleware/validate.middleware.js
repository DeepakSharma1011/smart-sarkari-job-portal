const { validationResult } = require("express-validator");

/* ========= VALIDATION ========= */
const validate = (req, res, next) => {

  const errors = validationResult(req);

  // check errors
  if (!errors.isEmpty()) {

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });


  }

  next();
};

module.exports = { validate };
