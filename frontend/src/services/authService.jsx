import api from './api';

// Vì api.js có baseURL là ".../api", nên ở đây ta thêm "/v1/public"
// Kết quả gọi sẽ là: http://localhost:5000/api/v1/public/login
const AUTH_URL = '/v1/public'; 

const login = async (email, password) => {
    try {
        const response = await api.post(`${AUTH_URL}/login`, {
            email,
            password,
        });
        
        // --- ĐOẠN QUAN TRỌNG CẦN SỬA ĐÂY ---
        const data = response.data?.data || response.data; // Lấy cục data trả về
        
        // 1. Tìm accessToken từ data trả về
        const accessToken = data.accessToken || data.token;

        // 2. Lưu token ra riêng với tên key là "token" để api.js đọc được
        if (accessToken) {
            localStorage.setItem('token', accessToken); 
        }

        // 3. Vẫn lưu thông tin user để hiển thị lên Header (Avatar, Tên...)
        localStorage.setItem('user', JSON.stringify(data));

        return response.data;
    } catch (error) {
        throw error;
    }
};

const register = async (email, password, fullName, role_id) => {
    try {
        const res = await api.post(`${AUTH_URL}/register`, { 
            email, 
            password, 
            fullName, 
            role_id 
        });
        return res.data?.data || res.data;
    } catch (error) {
        throw error;
    }
};

const logout = () => {
    // Xóa cả 2 key khi logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const authService = {
    login,
    register,
    logout
};

export default authService;