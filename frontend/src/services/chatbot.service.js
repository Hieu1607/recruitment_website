import api from './api'; // Import instance axios bạn đã cấu hình

// Dựa vào docs: Base URL là /api/v1/chatbot
// Vì api.js đã có /api nên ta chỉ cần thêm /v1/chatbot
const BASE_ENDPOINT = '/v1/chatbot'; 

export const ChatbotService = {
  
  // 1. API CHO KHÁCH (Guest)
  chatGuest: async (question) => {
    try {
      // Gọi POST /api/v1/chatbot/guest
      const response = await api.post(`${BASE_ENDPOINT}/guest`, { question });
      return response.data; // Axios trả dữ liệu trong .data
    } catch (error) {
      console.error("Lỗi Chatbot Guest:", error);
      return { success: false, answer: "Lỗi kết nối server." };
    }
  },

  // 2. API CHO ỨNG VIÊN (JobSeeker)
  chatJobseeker: async (question) => {
    try {
      // Không cần truyền header Token, api.js tự lo rồi
      const response = await api.post(`${BASE_ENDPOINT}/jobseeker`, { question });
      return response.data;
    } catch (error) {
      console.error("Lỗi Chatbot Jobseeker:", error);
      return { success: false, answer: "Lỗi kết nối server." };
    }
  },

  // 3. API CHO NHÀ TUYỂN DỤNG (Employer)
  chatEmployer: async (question, companyId, jobId = null, jobApplicationId = null) => {
    try {
      const payload = { 
        question, 
        companyId: parseInt(companyId) 
      };

      if (jobId) payload.jobId = parseInt(jobId);
      if (jobApplicationId) payload.jobApplicationId = parseInt(jobApplicationId);

      // Không cần truyền header Token
      const response = await api.post(`${BASE_ENDPOINT}/employer`, payload);
      return response.data;
    } catch (error) {
      console.error("Lỗi Chatbot Employer:", error);
      return { success: false, answer: "Lỗi kết nối server." };
    }
  }
};