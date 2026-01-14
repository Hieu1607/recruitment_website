// src/services/chatbot.service.js

// Giả sử bạn có biến môi trường cho URL API, nếu không thì hardcode tạm
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Hàm helper để lấy token từ localStorage (hoặc nơi bạn lưu token)
const getAuthHeader = () => {
  const token = localStorage.getItem('token'); // Sửa key này theo dự án của bạn
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const ChatbotService = {
  // 1. API cho Khách
  chatGuest: async (question) => {
    const response = await fetch(`${API_URL}/chatbot/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return response.json();
  },

  // 2. API cho Ứng viên (Jobseeker)
  chatJobseeker: async (question) => {
    const response = await fetch(`${API_URL}/chatbot/jobseeker`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ question }),
    });
    return response.json();
  },

  // 3. API cho Nhà tuyển dụng (Employer)
  chatEmployer: async (question, companyId, jobId = null, jobApplicationId = null) => {
    const response = await fetch(`${API_URL}/chatbot/employer`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ question, companyId, jobId, jobApplicationId }),
    });
    return response.json();
  }
};