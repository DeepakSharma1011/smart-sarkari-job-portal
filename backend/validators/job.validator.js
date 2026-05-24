const { body } = require('express-validator');

const createJobValidator = [
  body('jobName')
    .notEmpty()
    .withMessage('Job name is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Job name cannot exceed 200 characters'),

  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .trim(),

  body('qualificationRequired')
    .notEmpty()
    .withMessage('Qualification is required')
    .isIn(['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'])
    .withMessage('Invalid qualification value'),

  body('minAge')
    .notEmpty()
    .withMessage('Minimum age is required')
    .isInt({ min: 15 })
    .withMessage('Minimum age must be at least 15'),

  body('maxAge')
    .notEmpty()
    .withMessage('Maximum age is required')
    .isInt({ max: 65 })
    .withMessage('Maximum age must be at most 65'),

  body('lastDate')
    .notEmpty()
    .withMessage('Last date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),

  body('field')
    .notEmpty()
    .withMessage('Job field is required')
    .isIn(['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'Other'])
    .withMessage('Invalid job field'),

  body('skillsRequired')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('applicationFee.general')
    .optional()
    .isNumeric()
    .withMessage('Application fee must be a number'),
];

const updateJobValidator = [
  body('jobName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Job name cannot exceed 200 characters'),

  body('qualificationRequired')
    .optional()
    .isIn(['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'])
    .withMessage('Invalid qualification value'),

  body('field')
    .optional()
    .isIn(['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'Other'])
    .withMessage('Invalid job field'),
];

module.exports = { createJobValidator, updateJobValidator };
