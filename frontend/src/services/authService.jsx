import api from './api';

// Đường dẫn này nối vào http://localhost:5000/api thành http://localhost:5000/api/v1/public
const AUTH_URL = '/v1/public';

const login = async (email, password) => {
    // Gọi POST tới /api/v1/public/login
    const res = await api.post(`${AUTH_URL}/login`, { email, password });
    if (res.data.token) {
        localStorage.setItem('token', res.data.token);
    }
    return res.data;
};

const register = async (userData) => {
    // Gọi POST tới /api/v1/public/register
    const res = await api.post(`${AUTH_URL}/register`, userData);
    return res.data;
};

const authService = {
    login,
    register
};

export default authService;