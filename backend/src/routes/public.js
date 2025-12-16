/**
 * Public Routes
 * Routes accessible without authentication
 * Examples: login, register, public job listings, job details
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login); // Đăng nhập
router.post('/register', authController.register); // Đăng ký

module.exports = router;

