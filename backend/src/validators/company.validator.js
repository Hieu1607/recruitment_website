/**
 * Company Validator
 * Validates company data for CRUD operations
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation rules for creating a company
 */
const createCompanyValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('size')
    .optional()
    .trim()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+', ''])
    .withMessage('Invalid company size'),

  body('type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company type must not exceed 100 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),

  body('website')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      // Simple URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(value)) {
        throw new Error('Invalid website URL format');
      }
      return true;
    }),
];

/**
 * Validation rules for updating a company
 */
const updateCompanyValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid company ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('size')
    .optional()
    .trim()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+', ''])
    .withMessage('Invalid company size'),

  body('type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company type must not exceed 100 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),

  body('website')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(value)) {
        throw new Error('Invalid website URL format');
      }
      return true;
    }),
];
];

/**
 * Validation rules for getting a company by ID
 */
const getCompanyByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid company ID'),
];

/**
 * Validation rules for deleting a company
 */
const deleteCompanyValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid company ID'),
];

/**
 * Validation rules for listing companies (with pagination and search)
 */
const listCompaniesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search term must not exceed 255 characters'),

  query('type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Type filter must not exceed 100 characters'),

  query('size')
    .optional()
    .trim()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'])
    .withMessage('Invalid size filter'),
];

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

module.exports = {
  createCompanyValidation,
  updateCompanyValidation,
  getCompanyByIdValidation,
  deleteCompanyValidation,
  listCompaniesValidation,
  handleValidationErrors,
};
