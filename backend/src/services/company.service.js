/**
 * Company Service
 * Business logic for company CRUD operations
 */

const { Company } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { Op } = require('sequelize');
const minioService = require('./minio.service');

/**
 * Create a new company
 * @param {Object} companyData - Company data
 * @param {number} userId - ID of the user creating the company
 * @param {Object} logoFile - Logo file from multer (optional)
 * @returns {Promise<Object>} Created company
 */
const createCompany = async (companyData, userId, logoFile = null) => {
  // Check if user already has a company
  const existingCompany = await Company.findOne({ where: { user_id: userId } });
  
  if (existingCompany) {
    throw new BadRequestError('User already has a company registered');
  }

  let logoUrl = null;
  
  // Upload logo to MinIO if file provided
  if (logoFile) {
    try {
      logoUrl = await minioService.uploadCompanyLogo(logoFile, `temp_${Date.now()}`);
    } catch (error) {
      throw new BadRequestError(`Failed to upload logo: ${error.message}`);
    }
  }

  // Create company with user_id
  const company = await Company.create({
    ...companyData,
    logo_company_url: logoUrl,
    user_id: userId
  });

  // Update logo URL with actual company ID if logo was uploaded
  if (logoUrl && company.id) {
    try {
      const newLogoUrl = await minioService.uploadCompanyLogo(logoFile, company.id);
      await company.update({ logo_company_url: newLogoUrl });
      
      // Clean up temporary logo
      try {
        await minioService.deleteFileByUrl(logoUrl);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary logo:', cleanupError.message);
      }
    } catch (error) {
      console.error('Failed to update logo with company ID:', error.message);
    }
  }

  return company;
};

/**
 * Get all companies with optional filters and pagination
 * @param {Object} options - Query options (page, limit, search, type, size)
 * @returns {Promise<Object>} Companies list and pagination info
 */
const getAllCompanies = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    type = '',
    size = ''
  } = options;

  const offset = (page - 1) * limit;
  const where = {};

  // Add search filter (search in name and description)
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Add type filter
  if (type) {
    where.type = { [Op.iLike]: `%${type}%` };
  }

  // Add size filter
  if (size) {
    where.size = size;
  }

  // Get companies with count
  const { count, rows: companies } = await Company.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id', 'DESC']],
    attributes: { exclude: ['user_id'] } // Don't expose user_id in list
  });

  const totalPages = Math.ceil(count / limit);

  return {
    companies,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: count,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get company by ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Company details
 */
const getCompanyById = async (companyId) => {
  const company = await Company.findByPk(companyId, {
    attributes: { exclude: ['user_id'] } // Don't expose user_id
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return company;
};

/**
 * Get company by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Company details
 */
const getCompanyByUserId = async (userId) => {
  const company = await Company.findOne({
    where: { user_id: userId }
  });

  if (!company) {
    throw new NotFoundError('No company found for this user');
  }

  return company;
};

/**
 * Update company
 * @param {number} companyId - Company ID
 * @param {Object} updateData - Data to update
 * @param {number} userId - ID of the user performing the update
 * @param {Object} logoFile - Logo file from multer (optional)
 * @returns {Promise<Object>} Updated company
 */
const updateCompany = async (companyId, updateData, userId, logoFile = null) => {
  const company = await Company.findByPk(companyId);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Check if user owns this company
  if (company.user_id !== userId) {
    throw new ForbiddenError('You do not have permission to update this company');
  }

  let logoUrl = company.logo_company_url; // Keep existing logo by default
  
  // Upload new logo to MinIO if file provided
  if (logoFile) {
    try {
      const oldLogoUrl = company.logo_company_url;
      logoUrl = await minioService.uploadCompanyLogo(logoFile, companyId);
      
      // Delete old logo if it exists
      if (oldLogoUrl) {
        try {
          await minioService.deleteFileByUrl(oldLogoUrl);
        } catch (deleteError) {
          console.warn('Failed to delete old logo:', deleteError.message);
        }
      }
    } catch (error) {
      throw new BadRequestError(`Failed to upload logo: ${error.message}`);
    }
  }

  // Remove user_id from update data to prevent changing ownership
  delete updateData.user_id;

  // Update company with new logo URL
  await company.update({
    ...updateData,
    logo_company_url: logoUrl
  });

  return company;
};

/**
 * Delete company
 * @param {number} companyId - Company ID
 * @param {number} userId - ID of the user performing the deletion
 * @returns {Promise<void>}
 */
const deleteCompany = async (companyId, userId) => {
  const company = await Company.findByPk(companyId);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Check if user owns this company
  if (company.user_id !== userId) {
    throw new ForbiddenError('You do not have permission to delete this company');
  }

  // Delete company logo from MinIO if exists
  if (company.logo_company_url) {
    try {
      await minioService.deleteFileByUrl(company.logo_company_url);
    } catch (error) {
      console.warn('Failed to delete company logo:', error.message);
    }
  }

  // Delete company
  await company.destroy();
};

/**
 * Check if company exists
 * @param {number} companyId - Company ID
 * @returns {Promise<boolean>} True if exists
 */
const companyExists = async (companyId) => {
  const company = await Company.findByPk(companyId);
  return !!company;
};

/**
 * Check if user owns company
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if user owns the company
 */
const userOwnsCompany = async (companyId, userId) => {
  const company = await Company.findOne({
    where: {
      id: companyId,
      user_id: userId
    }
  });
  return !!company;
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getCompanyByUserId,
  updateCompany,
  deleteCompany,
  companyExists,
  userOwnsCompany
};
