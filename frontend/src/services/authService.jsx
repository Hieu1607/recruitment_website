import api from './api';

const authService = {
  // 1. Đăng nhập
  login: async (credentials) => {
    const response = await api.post('/v1/public/login', credentials);
    return response.data; 
  },

  // 2. Đăng ký
  register: async (userData) => {
    const response = await api.post('/v1/public/register', userData);
    return response.data;
  },

  // 3. Lấy thông tin User (Cái này giữ nguyên vì nó nằm ở userProfileRoutes)
  getCurrentUser: async () => {
    // Dựa theo index.js dòng: router.use('/profiles', userProfileRoutes);
    // Thì đường dẫn này đúng là: /v1/profiles/me
    const response = await api.get('/v1/profiles/me'); 
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;