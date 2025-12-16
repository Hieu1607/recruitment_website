/**
 * JobApplication Service
 */
const { JobApplication, Job, Company } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { Op } = require('sequelize');

const applyForJob = async (jobId, userId) => {
  const job = await Job.findByPk(jobId);
  if (!job) throw new NotFoundError('Job not found');

  // Check if already applied
  const existing = await JobApplication.findOne({
    where: { job_id: jobId, user_id: userId },
  });
  if (existing) {
    throw new BadRequestError('You have already applied for this job');
  }

  const application = await JobApplication.create({
    job_id: jobId,
    user_id: userId,
    status: 'applied',
  });

  return application;
};

const getMyApplications = async (userId, options = {}) => {
  const { page = 1, limit = 10, status = '', job_id } = options;
  const offset = (page - 1) * limit;
  const where = { user_id: userId };

  if (status) {
    where.status = status;
  }
  if (job_id) {
    where.job_id = job_id;
  }

  const { count, rows } = await JobApplication.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id', 'DESC']],
    include: [
      { model: Job, as: 'job', attributes: ['id', 'title', 'company_id', 'location', 'salary'] },
    ],
  });

  const totalPages = Math.ceil(count / limit);
  return {
    applications: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: count,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getApplicationsForJob = async (jobId, userId, options = {}) => {
  const job = await Job.findByPk(jobId);
  if (!job) throw new NotFoundError('Job not found');

  const company = await Company.findByPk(job.company_id);
  if (!company || company.user_id !== userId) {
    throw new ForbiddenError('You do not own this job');
  }

  const { page = 1, limit = 10, status = '', user_id } = options;
  const offset = (page - 1) * limit;
  const where = { job_id: jobId };

  if (status) {
    where.status = status;
  }
  if (user_id) {
    where.user_id = user_id;
  }

  const { count, rows } = await JobApplication.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id', 'DESC']],
  });

  const totalPages = Math.ceil(count / limit);
  return {
    applications: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: count,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getApplicationById = async (applicationId) => {
  const application = await JobApplication.findByPk(applicationId);
  if (!application) throw new NotFoundError('Application not found');
  return application;
};

const updateApplicationStatus = async (applicationId, newStatus, userId) => {
  const application = await JobApplication.findByPk(applicationId);
  if (!application) throw new NotFoundError('Application not found');

  const job = await Job.findByPk(application.job_id);
  const company = await Company.findByPk(job.company_id);

  if (!company || company.user_id !== userId) {
    throw new ForbiddenError('You do not have permission to update this application');
  }

  await application.update({ status: newStatus });
  return application;
};

const deleteApplication = async (applicationId, userId) => {
  const application = await JobApplication.findByPk(applicationId);
  if (!application) throw new NotFoundError('Application not found');

  // Only applicant or job owner can delete
  if (application.user_id !== userId) {
    const job = await Job.findByPk(application.job_id);
    const company = await Company.findByPk(job.company_id);
    if (!company || company.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to delete this application');
    }
  }

  await application.destroy();
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};
