/**
 * Chatbot Routes
 * Defines chatbot endpoints for different user types
 */

const express = require('express');
const router = express.Router();

const chatbotController = require('../controllers/chatbot.controller');
const { authenticate, authorizeJobseeker, authorizeEmployer } = require('../middlewares/auth');
const {
  guestChatValidator,
  jobseekerChatValidator,
  employerChatValidator,
  handleValidationErrors,
} = require('../validators/chatbot.validator');

/**
 * Guest chatbot endpoint - No authentication required
 * POST /api/chatbot/guest
 */
router.post(
  '/guest',
  guestChatValidator,
  handleValidationErrors,
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
  handleValidationErrors,
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
  handleValidationErrors,
  chatbotController.employerChatHandler
);

module.exports = router;
