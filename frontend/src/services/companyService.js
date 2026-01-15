import api from './api';

const companyService = {
  // 1. Lấy danh sách công ty (Có phân trang) -> [UPDATE] Thêm tham số search
  getAllCompanies: async (page = 1, limit = 10, search = '') => {
    try {
      // Gửi params page, limit và search lên server
      const response = await api.get('/v1/companies', { 
        params: { page, limit, search } 
      });
      
      // [FIX] Xử lý an toàn: Lấy phần body thực sự dù axios có cấu hình interceptor hay chưa
      const rawData = response.data ? response.data : response;

      // Tìm mảng dữ liệu công ty (ưu tiên data.companies, sau đó đến data)
      const companiesList = rawData.data?.companies || rawData.data || [];
      
      // Tìm thông tin phân trang
      const paginationInfo = rawData.pagination || rawData.meta || {};

      return { data: companiesList, pagination: paginationInfo }; 
    } catch (error) {
      console.error("Lỗi lấy danh sách công ty:", error);
      return { data: [], pagination: {} }; 
    }
  },

  // 2. Lấy chi tiết công ty theo ID (Public)
  getCompanyById: async (id) => {
    try {
      const response = await api.get(`/v1/companies/${id}`);
      
      // [FIX] Dựa trên JSON bạn gửi: { "success": true, "data": { ... } }
      // Axios trả về response.data là cái JSON kia -> cần lấy .data thêm 1 lần nữa
      if (response.data && response.data.data) {
          return response.data.data;
      }
      
      // Fallback nếu API trả về trực tiếp object
      return response.data || response;
    } catch (error) {
      console.error("Lỗi lấy chi tiết công ty:", error);
      throw error;
    }
  },

  // 3. Lấy công ty của tôi (Protected)
  getMyCompany: async () => {
    try {
      const response = await api.get('/v1/companies/my/company');
      return response.data?.data || null;
    } catch (error) {
      return null;
    }
  },

  // 4. Tạo công ty mới (Protected)
  createCompany: async (formData) => {
    const response = await api.post('/v1/companies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data?.data;
  },

  // 5. Cập nhật công ty (Protected)
  updateCompany: async (id, formData) => {
    const response = await api.put(`/v1/companies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data;
  },

  // 6. Xóa công ty (Protected)
  deleteCompany: async (id) => {
    const response = await api.delete(`/v1/companies/${id}`);
    return response.data;
  }
};

export default companyService;