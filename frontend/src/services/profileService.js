import api from './api';

// --- DÀNH CHO ỨNG VIÊN (USER) ---
// API Profile giữ nguyên như cũ
const PROFILE_URL = '/v1/profiles'; // Hoặc đường dẫn profile trong backend của bạn

export const getMyProfile = async () => {
  try {
    const res = await api.get(`${PROFILE_URL}/me`);
    return res.data.data; 
  } catch (error) {
    return null;
  }
};

export const updateMyProfile = async (formData) => {
  const res = await api.put(`${PROFILE_URL}/me`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

// --- DÀNH CHO NHÀ TUYỂN DỤNG (COMPANY) ---

// 1. Lấy công ty của tôi (Theo doc: GET /companies/my/company)
export const getMyCompany = async () => {
  try {
    // Lưu ý: Đường dẫn này phải khớp với route backend
    // Nếu backend bạn prefix /api thì api.js đã lo phần đó.
    // Ở đây ta gọi: /companies/my/company
    const res = await api.get('/companies/my/company'); 
    return res.data.data;
  } catch (error) {
    // Backend trả về 404 nếu chưa có công ty -> FE sẽ hiểu là cần tạo mới
    return null;
  }
};

// 2. Tạo công ty mới (Theo doc: POST /companies)
// Dùng khi User mới đăng ký, chưa có Company
export const createCompanyProfile = async (data) => {
    // Endpoint tạo mới thường không cần ID
    const res = await api.post('/companies', data);
    return res.data.data;
};

// 3. Cập nhật công ty (Theo doc: PUT /companies/:id)
// Dùng khi đã có Company ID
export const updateCompanyProfile = async (id, data) => {
  if (!id) throw new Error("Missing Company ID");
  const res = await api.put(`/companies/${id}`, data); 
  return res.data.data;
};

const profileService = {
  getMyProfile,
  updateMyProfile,
  getMyCompany,
  createCompanyProfile,
  updateCompanyProfile
};

export default profileService;