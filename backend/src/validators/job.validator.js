/**
 * Job Validator
 */
const { body, param, query, validationResult } = require('express-validator');

const createJobValidation = [
  body('company_id').isInt({ min: 1 }).withMessage('company_id is required and must be a positive integer'),
  body('title').trim().notEmpty().withMessage('title is required').isLength({ max: 255 }).withMessage('title must be at most 255 characters'),
  body('level').optional().trim().isLength({ max: 100 }).withMessage('level must be at most 100 characters'),
  body('salary').optional().trim().isLength({ max: 100 }).withMessage('salary must be at most 100 characters'),
  body('location').optional().trim().isLength({ max: 255 }).withMessage('location must be at most 255 characters'),
  body('deadline').optional().isISO8601().withMessage('deadline must be a valid date (YYYY-MM-DD)'),
  body('description').optional().trim().isLength({ max: 10000 }).withMessage('description too long'),
  body('requirements').optional().trim().isLength({ max: 10000 }).withMessage('requirements too long'),
  body('benefits').optional().trim().isLength({ max: 10000 }).withMessage('benefits too long'),
  body('status').optional().trim().isLength({ max: 50 }).withMessage('status must be at most 50 characters'),
];

const updateJobValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid job ID'),
  body('company_id').optional().isInt({ min: 1 }).withMessage('company_id must be a positive integer'),
  body('title').optional().trim().notEmpty().withMessage('title cannot be empty').isLength({ max: 255 }).withMessage('title must be at most 255 characters'),
  body('level').optional().trim().isLength({ max: 100 }).withMessage('level must be at most 100 characters'),
  body('salary').optional().trim().isLength({ max: 100 }).withMessage('salary must be at most 100 characters'),
  body('location').optional().trim().isLength({ max: 255 }).withMessage('location must be at most 255 characters'),
  body('deadline').optional().isISO8601().withMessage('deadline must be a valid date (YYYY-MM-DD)'),
  body('description').optional().trim().isLength({ max: 10000 }).withMessage('description too long'),
  body('requirements').optional().trim().isLength({ max: 10000 }).withMessage('requirements too long'),
  body('benefits').optional().trim().isLength({ max: 10000 }).withMessage('benefits too long'),
  body('status').optional().trim().isLength({ max: 50 }).withMessage('status must be at most 50 characters'),
];

const getJobByIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid job ID'),
];

const deleteJobValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid job ID'),
];

const listJobsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 10000 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 255 }).withMessage('Search term must not exceed 255 characters'),
  query('location').optional().trim().isLength({ max: 255 }).withMessage('Location filter must not exceed 255 characters'),
  query('company_id').optional().isInt({ min: 1 }).withMessage('company_id must be a positive integer'),
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
  createJobValidation,
  updateJobValidation,
  getJobByIdValidation,
  deleteJobValidation,
  listJobsValidation,
  handleValidationErrors,
};
