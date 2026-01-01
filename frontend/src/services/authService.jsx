import api from './api';

const AUTH_URL = '/v1/public';

const login = async (email, password) => {

    const res = await api.post(`${AUTH_URL}/login`, { email, password });
    if (res.data.token) {
        localStorage.setItem('token', res.data.token);
    }
    return res.data;
};

const register = async (userData) => {
    const res = await api.post(`${AUTH_URL}/register`, userData);
    return res.data;
};

const authService = {
    login,
    register
};

export default authService;