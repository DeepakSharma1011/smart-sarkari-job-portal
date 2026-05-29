const { body } = require("express-validator");

const registerValidator = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email").isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters"),

  body("phone")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerValidator,
  loginValidator,
};
