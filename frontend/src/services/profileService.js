import api from './api';

// Vì api.js baseURL là "http://localhost:5000/api"
// Nên ở đây ta bắt đầu bằng "/v1/profiles"
// Kết quả ghép lại sẽ đúng chuẩn: http://localhost:5000/api/v1/profiles/me
const PROFILE_URL = '/v1/profiles'; 

export const getMyProfile = async () => {
  // api.get sẽ tự động lấy token từ localStorage (như bạn cấu hình bên api.js)
  const res = await api.get(`${PROFILE_URL}/me`);
  
  // Trả về data (backend trả về dạng { success: true, data: {...} })
  return res.data.data; 
};

export const updateMyProfile = async (formData) => {
  // Khi upload file (avatar/cv), cần header multipart/form-data
  // Token vẫn được api.js tự động thêm vào
  const res = await api.put(`${PROFILE_URL}/me`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data.data;
};