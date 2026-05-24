const { body } = require('express-validator');

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),

  body('qualification')
    .optional()
    .isIn(['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'])
    .withMessage('Invalid qualification value'),

  body('age')
    .optional()
    .isInt({ min: 15, max: 65 })
    .withMessage('Age must be between 15 and 65'),

  body('category')
    .optional()
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'])
    .withMessage('Invalid category value'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('interestedFields')
    .optional()
    .isArray()
    .withMessage('Interested fields must be an array'),

  body('interestedFields.*')
    .optional()
    .isIn(['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State PSC', 'Teaching', 'Police', 'Other'])
    .withMessage('Invalid interested field value'),
];

module.exports = { updateProfileValidator };
