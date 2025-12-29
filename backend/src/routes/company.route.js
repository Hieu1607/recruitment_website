/**
 * Company Routes
 * RESTful routes for company CRUD operations
 */

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const companyValidator = require('../validators/company.validator');
const { authenticate } = require('../middlewares/auth');
const { uploadCompanyLogo, handleUploadErrors } = require('../middlewares/upload');

// Public routes - accessible without authentication
router.get('/', 
    companyValidator.listCompaniesValidation,
    companyValidator.handleValidationErrors,
    companyController.getAllCompanies
); // GET /companies - List all companies with pagination/filters

router.get('/:id', 
    companyValidator.getCompanyByIdValidation,
    companyValidator.handleValidationErrors,
    companyController.getCompanyById
); // GET /companies/:id - Get company by ID

// Protected routes - require authentication
router.post('/', 
    authenticate,
    uploadCompanyLogo,
    handleUploadErrors,
    companyValidator.createCompanyValidation,
    companyValidator.handleValidationErrors,
    companyController.createCompany
); // POST /companies - Create new company

router.get('/my/company', 
    authenticate,
    companyController.getMyCompany
); // GET /companies/my/company - Get current user's company

router.put('/:id', 
    authenticate,
    uploadCompanyLogo,
    handleUploadErrors,
    companyValidator.updateCompanyValidation,
    companyValidator.handleValidationErrors,
    companyController.updateCompany
); // PUT /companies/:id - Update company

router.delete('/:id', 
    authenticate,
    companyValidator.deleteCompanyValidation,
    companyValidator.handleValidationErrors,
    companyController.deleteCompany
); // DELETE /companies/:id - Delete company

module.exports = router;
