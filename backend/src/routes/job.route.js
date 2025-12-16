/**
 * Job Routes
 */
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const jobValidator = require('../validators/job.validator');
const { authenticate } = require('../middlewares/auth');

// Public
router.get('/',
  jobValidator.listJobsValidation,
  jobValidator.handleValidationErrors,
  jobController.getAllJobs
);

router.get('/:id',
  jobValidator.getJobByIdValidation,
  jobValidator.handleValidationErrors,
  jobController.getJobById
);

// Protected
router.post('/',
  authenticate,
  jobValidator.createJobValidation,
  jobValidator.handleValidationErrors,
  jobController.createJob
);

router.put('/:id',
  authenticate,
  jobValidator.updateJobValidation,
  jobValidator.handleValidationErrors,
  jobController.updateJob
);

router.delete('/:id',
  authenticate,
  jobValidator.deleteJobValidation,
  jobValidator.handleValidationErrors,
  jobController.deleteJob
);

module.exports = router;
