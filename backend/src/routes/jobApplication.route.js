/**
 * JobApplication Routes
 */
const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplication.controller');
const jobApplicationValidator = require('../validators/jobApplication.validator');
const { authenticate } = require('../middlewares/auth');

// Protected - user operations
router.post('/',
  authenticate,
  jobApplicationValidator.createApplicationValidation,
  jobApplicationValidator.handleValidationErrors,
  jobApplicationController.applyForJob
);

router.get('/my-applications',
  authenticate,
  jobApplicationValidator.listApplicationsValidation,
  jobApplicationValidator.handleValidationErrors,
  jobApplicationController.getMyApplications
);

router.get('/job/:jobId',
  authenticate,
  jobApplicationValidator.listApplicationsValidation,
  jobApplicationValidator.handleValidationErrors,
  jobApplicationController.getApplicationsForJob
);

router.get('/:id',
  jobApplicationValidator.getApplicationByIdValidation,
  jobApplicationValidator.handleValidationErrors,
  jobApplicationController.getApplicationById
);

router.put('/:id',
  authenticate,
  jobApplicationValidator.updateApplicationValidation,
  jobApplicationValidator.handleValidationErrors,
  jobApplicationController.updateApplicationStatus
);

router.delete('/:id',
  authenticate,
  jobApplicationValidator.deleteApplicationValidation,
  jobApplicationValidator.handleValidationErrors,
  jobApplicationController.deleteApplication
);

module.exports = router;
