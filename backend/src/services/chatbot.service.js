/**
 * Chatbot Service
 * Handles chatbot interactions using Groq API
 */

const { Groq } = require('groq-sdk');
const { UserProfile, Company, Job, JobApplication, User } = require('../models');
const { NotFoundError } = require('../utils/errors');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Build the message prompt for the LLM
 */
const buildPrompt = (question, jobseekerInfo = '', companyInfo = '', jobInfo = '') => {
  return `Với vai trò là 1 trợ lý tuyển dụng và hướng nghiệp thông minh, dựa trên thông tin được cung cấp, trả lời câu hỏi sau.
Trả lời với format gọn gàng, không sử dụng emoji.
Thông tin người tìm việc: ${jobseekerInfo}
Thông tin công ty: ${companyInfo}
Thông tin công việc: ${jobInfo}
Câu hỏi: ${question}`;
};

/**
 * Format jobseeker information
 */
const formatJobseekerInfo = (profile) => {
  if (!profile) return '';
  
  const parts = [];
  if (profile.full_name) parts.push(`Họ tên: ${profile.full_name}`);
  if (profile.phone) parts.push(`Số điện thoại: ${profile.phone}`);
  if (profile.address) parts.push(`Địa chỉ: ${profile.address}`);
  if (profile.date_of_birth) parts.push(`Ngày sinh: ${profile.date_of_birth}`);
  if (profile.bio) parts.push(`Giới thiệu: ${profile.bio}`);
  if (profile.skills) parts.push(`Kỹ năng: ${profile.skills}`);
  if (profile.experience) parts.push(`Kinh nghiệm: ${profile.experience}`);
  if (profile.education) parts.push(`Học vấn: ${profile.education}`);
  
  return parts.length > 0 ? parts.join(', ') : '';
};

/**
 * Format company information
 */
const formatCompanyInfo = (company) => {
  if (!company) return '';
  
  const parts = [];
  if (company.name) parts.push(`Tên công ty: ${company.name}`);
  if (company.description) parts.push(`Mô tả: ${company.description}`);
  if (company.industry) parts.push(`Ngành nghề: ${company.industry}`);
  if (company.location) parts.push(`Địa điểm: ${company.location}`);
  if (company.website) parts.push(`Website: ${company.website}`);
  if (company.company_size) parts.push(`Quy mô: ${company.company_size}`);
  
  return parts.length > 0 ? parts.join(', ') : '';
};

/**
 * Format job information
 */
const formatJobInfo = (job) => {
  if (!job) return '';
  
  const parts = [];
  if (job.title) parts.push(`Tiêu đề: ${job.title}`);
  if (job.description) parts.push(`Mô tả: ${job.description}`);
  if (job.requirements) parts.push(`Yêu cầu: ${job.requirements}`);
  if (job.salary_range) parts.push(`Mức lương: ${job.salary_range}`);
  if (job.location) parts.push(`Địa điểm: ${job.location}`);
  if (job.job_type) parts.push(`Loại hình: ${job.job_type}`);
  if (job.experience_level) parts.push(`Cấp độ kinh nghiệm: ${job.experience_level}`);
  
  return parts.length > 0 ? parts.join(', ') : '';
};

/**
 * Call Groq API and get response
 */
const getChatCompletion = async (prompt) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to get response from chatbot service');
  }
};

/**
 * Guest chatbot - No authentication required
 */
const guestChat = async (question) => {
  const prompt = buildPrompt(question);
  const response = await getChatCompletion(prompt);
  
  return {
    question,
    answer: response,
  };
};

/**
 * Jobseeker chatbot - Requires jobseeker authentication
 */
const jobseekerChat = async (userId, question) => {
  // Get jobseeker profile
  let profile = await UserProfile.findOne({ where: { user_id: userId } });
  
  if (!profile) {
    // Create empty profile if not exists
    profile = await UserProfile.create({ user_id: userId });
  }
  
  const jobseekerInfo = formatJobseekerInfo(profile);
  const prompt = buildPrompt(question, jobseekerInfo);
  const response = await getChatCompletion(prompt);
  
  return {
    question,
    jobseekerInfo: jobseekerInfo || 'Chưa có thông tin',
    answer: response,
  };
};

/**
 * Employer chatbot - Requires employer authentication
 */
const employerChat = async (companyId, question, jobId = null, jobApplicationId = null) => {
  // Get company information
  const company = await Company.findByPk(companyId);
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  const companyInfo = formatCompanyInfo(company);
  let jobInfo = '';
  let jobseekerInfo = '';
  
  // Get job information if jobId is provided
  if (jobId) {
    const job = await Job.findByPk(jobId);
    
    if (job) {
      jobInfo = formatJobInfo(job);
    }
  }
  
  // Get jobseeker information if jobApplicationId is provided
  if (jobApplicationId) {
    const jobApplication = await JobApplication.findByPk(jobApplicationId, {
      include: [
        {
          model: User,
          as: 'user',
          include: [
            {
              model: UserProfile,
              as: 'userProfile',
            },
          ],
        },
      ],
    });
    
    if (jobApplication && jobApplication.user && jobApplication.user.userProfile) {
      jobseekerInfo = formatJobseekerInfo(jobApplication.user.userProfile);
    }
  }
  
  const prompt = buildPrompt(question, jobseekerInfo, companyInfo, jobInfo);
  const response = await getChatCompletion(prompt);
  
  return {
    question,
    companyInfo: companyInfo || 'Chưa có thông tin',
    jobInfo: jobInfo || 'Chưa có thông tin',
    jobseekerInfo: jobseekerInfo || 'Chưa có thông tin',
    answer: response,
  };
};

module.exports = {
  guestChat,
  jobseekerChat,
  employerChat,
};
