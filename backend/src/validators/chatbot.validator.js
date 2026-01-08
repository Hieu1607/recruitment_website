/**
 * Chatbot Validator
 * Validation rules for chatbot endpoints
 */

const { body, query, validationResult } = require('express-validator');

const guestChatValidator = [
  body('question')
    .notEmpty()
    .withMessage('Question is required')
    .isString()
    .withMessage('Question must be a string')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Question must be between 1 and 2000 characters'),
];

const jobseekerChatValidator = [
  body('question')
    .notEmpty()
    .withMessage('Question is required')
    .isString()
    .withMessage('Question must be a string')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Question must be between 1 and 2000 characters'),
];

const employerChatValidator = [
  body('question')
    .notEmpty()
    .withMessage('Question is required')
    .isString()
    .withMessage('Question must be a string')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Question must be between 1 and 2000 characters'),
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isInt({ min: 1 })
    .withMessage('Company ID must be a positive integer'),
  body('jobId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Job ID must be a positive integer'),
  body('jobApplicationId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Job Application ID must be a positive integer'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({ 
      field: e.path || e.param, 
      message: e.msg, 
      value: e.value 
    }));
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: formatted 
    });
  }
  next();
};

module.exports = {
  guestChatValidator,
  jobseekerChatValidator,
  employerChatValidator,
  handleValidationErrors,
};
