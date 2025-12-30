/**
 * Company Controller
 * Handles HTTP requests for company CRUD operations
 */

const companyService = require('../services/company.service');
const { successResponse } = require('../utils/response');

/**
 * Create a new company
 * POST /api/companies
 */
const createCompany = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const companyData = req.body;
    const logoFile = req.file; // From multer middleware

    const company = await companyService.createCompany(companyData, userId, logoFile);

    return successResponse(
      res,
      201,
      company,
      'Company created successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all companies with filters and pagination
 * GET /api/companies
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      type: req.query.type,
      size: req.query.size
    };

    const result = await companyService.getAllCompanies(options);

    return successResponse(
      res,
      200,
      result.companies,
      'Companies retrieved successfully',
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get company by ID
 * GET /api/companies/:id
 */
const getCompanyById = async (req, res, next) => {
  try {
    const companyId = parseInt(req.params.id);
    
    const company = await companyService.getCompanyById(companyId);

    return successResponse(
      res,
      200,
      company,
      'Company retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user's company
 * GET /api/companies/my
 */
const getMyCompany = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const company = await companyService.getCompanyByUserId(userId);

    return successResponse(
      res,
      200,
      company,
      'Your company retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update company
 * PUT /api/companies/:id
 */
const updateCompany = async (req, res, next) => {
  try {
    const companyId = parseInt(req.params.id);
    const userId = req.user.id; // From auth middleware
    const updateData = req.body;
    const logoFile = req.file; // From multer middleware

    const company = await companyService.updateCompany(companyId, updateData, userId, logoFile);

    return successResponse(
      res,
      200,
      company,
      'Company updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete company
 * DELETE /api/companies/:id
 */
const deleteCompany = async (req, res, next) => {
  try {
    const companyId = parseInt(req.params.id);
    const userId = req.user.id; // From auth middleware

    await companyService.deleteCompany(companyId, userId);

    return successResponse(
      res,
      200,
      null,
      'Company deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  updateCompany,
  deleteCompany
};
