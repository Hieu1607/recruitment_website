/**
 * Authentication Context
 * Quản lý toàn bộ trạng thái đăng nhập, đăng xuất và thông tin user
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService'; 

const AuthContext = createContext();

// Hook custom 
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error("Phiên đăng nhập hết hạn:", error);
                    localStorage.removeItem('token'); // Xóa token rác nếu lỗi
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // 2. Hàm Đăng nhập
    const login = async (email, password) => {
        const data = await authService.login({ email, password });
        if (data.token) {
            localStorage.setItem('token', data.token);
            setUser(data.user); 
            return true;
        }
        return false;
    };

    // 3. Hàm Đăng xuất
    const logout = () => {
        authService.logout(); 
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Chỉ render giao diện khi đã check xong token để tránh lỗi chuyển trang */}
            {!loading && children}
        </AuthContext.Provider>
    );
};