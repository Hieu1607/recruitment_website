import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // 1. Chưa đăng nhập -> Đá về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã đăng nhập nhưng sai quyền -> Đá về Home
  if (allowedRoles && !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho vào
  return <Outlet />;
};

export default PrivateRoute; 