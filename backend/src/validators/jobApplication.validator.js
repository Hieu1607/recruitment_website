/**
 * JobApplication Validator
 */
const { body, param, query, validationResult } = require('express-validator');

/* ================= CREATE APPLICATION ================= */
const createApplicationValidation = [
  body('job_id')
    .isInt({ min: 1 })
    .withMessage('job_id is required and must be a positive integer'),

  body('cv_url')
    .optional()
    .isURL({
      require_tld: false,        // ✅ cho phép localhost / IP
      require_protocol: true,    // bắt buộc http/https
      protocols: ['http', 'https'],
    })
    .withMessage('cv_url must be a valid URL'),
];

/* ================= UPDATE APPLICATION ================= */
const updateApplicationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid application ID'),

  body('status')
    .isIn([
      'applied',
      'under_review',
      'interview_scheduled',
      'offered',
      'rejected',
    ])
    .withMessage(
      'Invalid status. Must be one of: applied, under_review, interview_scheduled, offered, rejected'
    ),
];

/* ================= GET BY ID ================= */
const getApplicationByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid application ID'),
];

/* ================= DELETE ================= */
const deleteApplicationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid application ID'),
];

/* ================= LIST APPLICATIONS ================= */
const listApplicationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn([
      'applied',
      'under_review',
      'interview_scheduled',
      'offered',
      'rejected',
    ])
    .withMessage('Invalid status filter'),

  query('job_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('job_id must be a positive integer'),

  query('user_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('user_id must be a positive integer'),
];

/* ================= HANDLE ERRORS ================= */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
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
