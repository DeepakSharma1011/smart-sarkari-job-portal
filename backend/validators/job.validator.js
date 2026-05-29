const { body } = require("express-validator");

const qualifications = [
  "10th",
  "12th",
  "ITI",
  "Diploma",
  "Graduation",
  "Post Graduation",
  "PhD",
];

const fields = [
  "SSC",
  "UPSC",
  "Railway",
  "Banking",
  "Defence",
  "State PSC",
  "Teaching",
  "Police",
  "IT & CS",
  "Other",
];

const createJobValidator = [
  body("title").notEmpty().withMessage("Title is required"),

  body("department").notEmpty().withMessage("Department is required"),

  body("qualification")
    .isIn(qualifications)
    .withMessage("Invalid qualification"),

  body("min_age").isInt({ min: 15 }).withMessage("Invalid minimum age"),

  body("max_age")
    .isInt({ max: 65 })
    .withMessage("Invalid maximum age")
    .custom((value, { req }) => {
      if (value < req.body.min_age) {
        throw new Error("Max age must be greater than min age");
      }
      return true;
    }),

  body("last_date").isISO8601().withMessage("Invalid last date"),

  body("field").isIn(fields).withMessage("Invalid field"),

  body("skillsRequired")
    .optional()
    .isArray()
    .withMessage("Skills must be array"),
];

const updateJobValidator = [
  body("qualification")
    .optional()
    .isIn(qualifications)
    .withMessage("Invalid qualification"),

  body("field").optional().isIn(fields).withMessage("Invalid field"),
];

module.exports = {
  createJobValidator,
  updateJobValidator,
};
