/**
 * Employer Routes
 * Routes accessible only to authenticated employers
 * Examples: create job, update job, view applications, manage company
 */

const express = require('express');
const router = express.Router();
const employerJobController = require('../controllers/employerJobController');
const applicationController = require('../controllers/applicationController');
// const { authenticate, authorizeEmployer } = require('../middlewares/auth');

// Apply authentication middleware to all routes
// router.use(authenticate);
// router.use(authorizeEmployer);

// Employer routes
router.get('/jobs', employerJobController.listJobs); // Lấy danh sách job của employer
router.post('/jobs', employerJobController.createJob); // Tạo job mới
router.put('/jobs/:id', employerJobController.updateJob); // Cập nhật job
router.delete('/jobs/:id', employerJobController.deleteJob); // Xóa job
router.get('/jobs/:id/applications', applicationController.getApplications); // Xem danh sách ứng viên cho một job
// router.get('/dashboard', dashboardController.getDashboard);

module.exports = router;

