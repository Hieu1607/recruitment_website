/**
 * Job Controller
 */
const jobService = require('../services/job.service');
const { successResponse } = require('../utils/response');

const createJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobData = req.body;
    const job = await jobService.createJob(jobData, userId);
    return successResponse(res, 201, job, 'Job created successfully');
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      location: req.query.location,
      company_id: req.query.company_id,
    };
    const result = await jobService.getAllJobs(options);
    return successResponse(res, 200, result.jobs, 'Jobs retrieved successfully', result.pagination);
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await jobService.getJobById(jobId);
    return successResponse(res, 200, job, 'Job retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const userId = req.user.id;
    const updateData = req.body;
    const job = await jobService.updateJob(jobId, updateData, userId);
    return successResponse(res, 200, job, 'Job updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const userId = req.user.id;
    await jobService.deleteJob(jobId, userId);
    return successResponse(res, 200, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
