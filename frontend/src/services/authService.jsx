import api from './api';
import { ROLE_ID } from '../utils/roles'; // Import để so sánh chính xác

const AUTH_URL = '/v1/public'; 

const login = async (email, password) => {
    try {
        const response = await api.post(`${AUTH_URL}/login`, {
            email,
            password,
        });
        
        const data = response.data?.data || response.data;
        
        // Lưu token và user info
        const accessToken = data.accessToken || data.token;
        if (accessToken) {
            localStorage.setItem('token', accessToken); 
        }
        localStorage.setItem('user', JSON.stringify(data.user || data));

        return response.data;
    } catch (error) {
        throw error;
    }
};

const register = async (email, password, fullName, role_id, companyData = null) => {
    try {
        // --- SỬA ĐOẠN NÀY ---
        // Chuyển đổi role_id (số) thành roleName (chữ) để Backend hiểu
        let roleName = 'jobseeker'; // Mặc định
        if (role_id === ROLE_ID.EMPLOYER) {
            roleName = 'employer';
        } else if (role_id === ROLE_ID.ADMIN) {
            roleName = 'admin';
        }

        const payload = { 
            email, 
            password, 
            fullName, 
            roleName: roleName, // Gửi đúng cái Backend cần
            // Các trường phụ trợ khác
            company: companyData 
        };

        const res = await api.post(`${AUTH_URL}/register`, payload);
        return res.data?.data || res.data;
    } catch (error) {
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const authService = {
    login,
    register,
    logout
};

export default authService;