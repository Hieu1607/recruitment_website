import api from './api';

const PROFILE_URL = '/v1/profiles'; 

// ================= USER (CÁ NHÂN) =================
export const getMyProfile = async () => {
  try {
    const res = await api.get(`${PROFILE_URL}/me`);
    return res.data.data; 
  } catch (error) {
    return null;
  }
};

export const updateMyProfile = async (formData) => {
  // QUAN TRỌNG: Cần header multipart/form-data để gửi ảnh
  const res = await api.put(`${PROFILE_URL}/me`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

// ================= PUBLIC PROFILE =================
// LẤY PROFILE THEO USER ID (để lấy tên ứng viên)
export const getProfileByUserId = async (userId) => {
  try {
    const res = await api.get(`${PROFILE_URL}/${userId}`);
    return res.data.data;
  } catch (error) {
    return null;
  }
};

// ================= COMPANY (NHÀ TUYỂN DỤNG) =================
export const getMyCompany = async () => {
  try {
    const res = await api.get('/v1/companies/my/company'); 
    return res.data.data;
  } catch (error) {
    return null;
  }
};

export const createCompanyProfile = async (formData) => {
  const res = await api.post('/v1/companies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const updateCompanyProfile = async (id, formData) => {
  if (!id) throw new Error("Missing Company ID");
  const res = await api.put(`/v1/companies/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }); 
  return res.data.data;
};

// ================= DEFAULT EXPORT =================
const profileService = {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
  getMyCompany,
  createCompanyProfile,
  updateCompanyProfile
};

export default profileService;
