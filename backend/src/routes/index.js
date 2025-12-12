/**
 * Main Routes Index
 * Combines all route modules and sets up API versioning
 */

const express = require('express');
const router = express.Router();

const publicRoutes = require('./public');
const jobseekerRoutes = require('./jobseeker');
const employerRoutes = require('./employer');

// API versioning
router.use('/public', publicRoutes);
router.use('/jobseeker', jobseekerRoutes);
router.use('/employer', employerRoutes);

module.exports = router;

