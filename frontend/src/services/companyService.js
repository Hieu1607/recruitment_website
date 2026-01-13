import api from './api';

const companyService = {
  // 1. Lấy danh sách công ty (Có phân trang)
  getAllCompanies: async (page = 1, limit = 10) => {
    try {
      // Gửi params page và limit lên server
      const response = await api.get('/v1/companies', { 
        params: { page, limit } 
      });
      
      // Trả về TRỌN BỘ response.data để component lấy được cả 'pagination' và 'data'
      // Cấu trúc mong đợi: { success: true, pagination: {...}, data: [...] }
      return response.data; 
    } catch (error) {
      console.error("Lỗi lấy danh sách công ty:", error);
      return { data: [], pagination: {} }; // Trả về object rỗng để không bị crash
    }
  },

  // 2. Lấy chi tiết công ty theo ID (Public)
  // Endpoint: GET /v1/companies/:id
  getCompanyById: async (id) => {
    try {
      const response = await api.get(`/v1/companies/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error("Lỗi lấy chi tiết công ty:", error);
      throw error;
    }
  },

  // 3. Lấy công ty của tôi (Protected)
  // Endpoint: GET /v1/companies/my/company
  getMyCompany: async () => {
    try {
      const response = await api.get('/v1/companies/my/company');
      return response.data?.data || null;
    } catch (error) {
      return null;
    }
  },

  // 4. Tạo công ty mới (Protected)
  // Endpoint: POST /v1/companies
  // Yêu cầu: Multipart/form-data
  createCompany: async (formData) => {
    const response = await api.post('/v1/companies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data?.data;
  },

  // 5. Cập nhật công ty (Protected)
  // Endpoint: PUT /v1/companies/:id
  updateCompany: async (id, formData) => {
    const response = await api.put(`/v1/companies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data;
  },

  // 6. Xóa công ty (Protected)
  // Endpoint: DELETE /v1/companies/:id
  deleteCompany: async (id) => {
    const response = await api.delete(`/v1/companies/${id}`);
    return response.data;
  }
};

export default companyService;