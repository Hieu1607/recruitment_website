/**
 * Main Routes Index
 * Combines all route modules and sets up API versioning
 */

const express = require('express');
const router = express.Router();

const publicRoutes = require('./public');
const companyRoutes = require('./company.route');
const userRoutes = require('./userRoutes');
const jobRoutes = require('./job.route');
const userProfileRoutes = require('./userProfile.route');
const jobApplicationRoutes = require('./jobApplication.route');

// API versioning
router.use('/public', publicRoutes);
router.use('/companies', companyRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/profiles', userProfileRoutes);
router.use('/applications', jobApplicationRoutes);

module.exports = router;

