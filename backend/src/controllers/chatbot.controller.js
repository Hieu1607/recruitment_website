/**
 * Chatbot Controller
 * Handles chatbot requests for different user types
 */

const chatbotService = require('../services/chatbot.service');
const { successResponse } = require('../utils/response');

/**
 * Guest chatbot endpoint
 * POST /api/chatbot/guest
 * Body: { question }
 */
const guestChatHandler = async (req, res, next) => {
  try {
    const { question } = req.body;
    
    const result = await chatbotService.guestChat(question);
    
    return successResponse(res, 200, result, 'Chat completed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Jobseeker chatbot endpoint
 * POST /api/chatbot/jobseeker
 * Body: { question }
 * Requires: Jobseeker authentication
 */
const jobseekerChatHandler = async (req, res, next) => {
  try {
    const { question } = req.body;
    const userId = req.userId;
    
    const result = await chatbotService.jobseekerChat(userId, question);
    
    return successResponse(res, 200, result, 'Chat completed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Employer chatbot endpoint
 * POST /api/chatbot/employer
 * Body: { question, companyId, jobId?, jobApplicationId? }
 * Requires: Employer authentication
 */
const employerChatHandler = async (req, res, next) => {
  try {
    const { question, companyId, jobId, jobApplicationId } = req.body;
    
    const result = await chatbotService.employerChat(
      companyId,
      question,
      jobId,
      jobApplicationId
    );
    
    return successResponse(res, 200, result, 'Chat completed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  guestChatHandler,
  jobseekerChatHandler,
  employerChatHandler,
};
