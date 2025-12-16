/**
 * Job Service
 */
const { Job, Company } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { Op } = require('sequelize');

const createJob = async (jobData, userId) => {
  const company = await Company.findOne({ where: { id: jobData.company_id, user_id: userId } });
  if (!company) {
    throw new ForbiddenError('You do not own this company');
  }
  const job = await Job.create(jobData);
  return job;
};

const getAllJobs = async (options = {}) => {
  const { page = 1, limit = 10, search = '', location = '', company_id } = options;
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { requirements: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (location) {
    where.location = { [Op.iLike]: `%${location}%` };
  }
  if (company_id) {
    where.company_id = company_id;
  }

  const { count, rows } = await Job.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id', 'DESC']],
  });

  const totalPages = Math.ceil(count / limit);
  return {
    jobs: rows,
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

const getJobById = async (jobId) => {
  const job = await Job.findByPk(jobId);
  if (!job) throw new NotFoundError('Job not found');
  return job;
};

const updateJob = async (jobId, updateData, userId) => {
  const job = await Job.findByPk(jobId);
  if (!job) throw new NotFoundError('Job not found');

  const company = await Company.findByPk(job.company_id);
  if (!company || company.user_id !== userId) {
    throw new ForbiddenError('You do not have permission to update this job');
  }

  // prevent ownership changes
  delete updateData.company_id;

  await job.update(updateData);
  return job;
};

const deleteJob = async (jobId, userId) => {
  const job = await Job.findByPk(jobId);
  if (!job) throw new NotFoundError('Job not found');

  const company = await Company.findByPk(job.company_id);
  if (!company || company.user_id !== userId) {
    throw new ForbiddenError('You do not have permission to delete this job');
  }

  await job.destroy();
};

const jobExists = async (jobId) => {
  const job = await Job.findByPk(jobId);
  return !!job;
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  jobExists,
};
