/**
 * UserProfile Validator
 */
const { body, param, validationResult } = require('express-validator');

const updateProfileValidation = [
  body('full_name').optional().trim().isLength({ max: 255 }).withMessage('full_name must be at most 255 characters'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('phone must be at most 20 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('address must be at most 500 characters'),
  body('dob').optional().isISO8601().withMessage('dob must be a valid date (YYYY-MM-DD)'),
  body('skills').optional().trim().isLength({ max: 5000 }).withMessage('skills too long'),
  body('experience').optional().trim().isLength({ max: 5000 }).withMessage('experience too long'),
  body('education').optional().trim().isLength({ max: 5000 }).withMessage('education too long'),
];

const getProfileByUserIdValidation = [
  param('userId').isInt({ min: 1 }).withMessage('Invalid user ID'),
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
  updateProfileValidation,
  getProfileByUserIdValidation,
  handleValidationErrors,
};
