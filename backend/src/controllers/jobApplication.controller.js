/**
 * JobApplication Controller
 */
const jobApplicationService = require('../services/jobApplication.service');
const { successResponse } = require('../utils/response');

const applyForJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { job_id } = req.body;
    const application = await jobApplicationService.applyForJob(job_id, userId);
    return successResponse(res, 201, application, 'Application submitted successfully');
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      job_id: req.query.job_id,
    };
    const result = await jobApplicationService.getMyApplications(userId, options);
    return successResponse(res, 200, result.applications, 'Applications retrieved successfully', result.pagination);
  } catch (error) {
    next(error);
  }
};

const getApplicationsForJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobId = parseInt(req.params.jobId);
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      user_id: req.query.user_id,
    };
    const result = await jobApplicationService.getApplicationsForJob(jobId, userId, options);
    return successResponse(res, 200, result.applications, 'Applications retrieved successfully', result.pagination);
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id);
    const application = await jobApplicationService.getApplicationById(applicationId);
    return successResponse(res, 200, application, 'Application retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id);
    const { status } = req.body;
    const application = await jobApplicationService.updateApplicationStatus(applicationId, status, userId);
    return successResponse(res, 200, application, 'Application status updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id);
    await jobApplicationService.deleteApplication(applicationId, userId);
    return successResponse(res, 200, null, 'Application deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};
