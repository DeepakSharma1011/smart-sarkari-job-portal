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

const categories = ["General", "OBC", "SC", "ST", "EWS", "PwD"];

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

const updateProfileValidator = [
  body("name").optional().isLength({ min: 2 }).withMessage("Invalid name"),

  body("phone")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  body("qualification")
    .optional()
    .isIn(qualifications)
    .withMessage("Invalid qualification"),

  body("age").optional().isInt({ min: 15, max: 65 }).withMessage("Invalid age"),

  body("category").optional().isIn(categories).withMessage("Invalid category"),

  body("skills").optional().isArray().withMessage("Skills must be array"),

  body("interestedFields")
    .optional()
    .isArray()
    .withMessage("Interested fields must be array"),

  body("interestedFields.*")
    .optional()
    .isIn(fields)
    .withMessage("Invalid field"),
];

module.exports = {
  updateProfileValidator,
};
