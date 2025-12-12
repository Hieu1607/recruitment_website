/**
 * Public Routes
 * Routes accessible without authentication
 * Examples: login, register, public job listings, job details
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jobSearchController = require('../controllers/jobSearchController');

// Public routes
router.post('/login', authController.login); // Đăng nhập
router.post('/register', authController.register); // Đăng ký
router.get('/jobs', jobSearchController.searchJobs); // Tìm kiếm job (public)
router.get('/jobs/:id', jobSearchController.getJobById); // Xem chi tiết job (public)

module.exports = router;

