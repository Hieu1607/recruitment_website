/**
 * JobApplication Validator
 */
const { body, param, query, validationResult } = require('express-validator');

const createApplicationValidation = [
  body('job_id').isInt({ min: 1 }).withMessage('job_id is required and must be a positive integer'),
];

const updateApplicationValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid application ID'),
  body('status')
    .isIn(['applied', 'under_review', 'interview_scheduled', 'offered', 'rejected'])
    .withMessage('Invalid status. Must be one of: applied, under_review, interview_scheduled, offered, rejected'),
];

const getApplicationByIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid application ID'),
];

const deleteApplicationValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid application ID'),
];

const listApplicationsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['applied', 'under_review', 'interview_scheduled', 'offered', 'rejected'])
    .withMessage('Invalid status filter'),
  query('job_id').optional().isInt({ min: 1 }).withMessage('job_id must be a positive integer'),
  query('user_id').optional().isInt({ min: 1 }).withMessage('user_id must be a positive integer'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({ field: e.path || e.param, message: e.msg, value: e.value }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors: formatted });
  }
  next();
};

module.exports = {
  createApplicationValidation,
  updateApplicationValidation,
  getApplicationByIdValidation,
  deleteApplicationValidation,
  listApplicationsValidation,
  handleValidationErrors,
};
