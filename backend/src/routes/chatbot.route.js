/**
 * Chatbot Routes
 * Defines chatbot endpoints for different user types
 */

const express = require('express');
const router = express.Router();

const chatbotController = require('../controllers/chatbot.controller');
const { authenticate, authorizeJobseeker, authorizeEmployer } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');
const {
  guestChatValidator,
  jobseekerChatValidator,
  employerChatValidator,
} = require('../validators/chatbot.validator');

/**
 * Guest chatbot endpoint - No authentication required
 * POST /api/chatbot/guest
 */
router.post(
  '/guest',
  guestChatValidator,
  validate,
  chatbotController.guestChatHandler
);

/**
 * Jobseeker chatbot endpoint - Requires jobseeker authentication
 * POST /api/chatbot/jobseeker
 */
router.post(
  '/jobseeker',
  authenticate,
  authorizeJobseeker,
  jobseekerChatValidator,
  validate,
  chatbotController.jobseekerChatHandler
);

/**
 * Employer chatbot endpoint - Requires employer authentication
 * POST /api/chatbot/employer
 */
router.post(
  '/employer',
  authenticate,
  authorizeEmployer,
  employerChatValidator,
  validate,
  chatbotController.employerChatHandler
);

module.exports = router;
