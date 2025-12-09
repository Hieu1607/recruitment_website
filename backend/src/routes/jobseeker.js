/**
 * Jobseeker Routes
 * Routes accessible only to authenticated job seekers
 * Examples: apply for job, view applications, update profile
 */

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const userController = require('../controllers/userController');
// const { authenticate, authorizeJobseeker } = require('../middlewares/auth');

// Apply authentication middleware to all routes
// router.use(authenticate);
// router.use(authorizeJobseeker);

// Jobseeker routes
router.post('/jobs/:id/apply', applicationController.submitApplication); // Nộp hồ sơ ứng tuyển
router.get('/applications', applicationController.getApplications); // Xem danh sách hồ sơ đã nộp
router.get('/profile', userController.getUserProfile); // Xem thông tin profile
router.put('/profile', userController.updateUserProfile); // Cập nhật profile

module.exports = router;

