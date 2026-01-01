// src/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../css/header.css';

const Header = ({ isAuthenticated, user, logout }) => {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/')}>JobCV</div>
        <nav className="nav-menu">
          <span className="nav-item" onClick={() => navigate('/')}>Việc làm</span>
          <span className="nav-item">Hồ sơ & CV</span>
          <span className="nav-item">Công ty</span>
        </nav>
      </div>

      <div className="header-right">
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              Hi, {user?.full_name || 'User'}
            </span>
            <button className="btn btn-register" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn-login" onClick={handleLogin}>
              Đăng nhập
            </button>
            <button className="btn btn-register" onClick={handleRegister}>
              Đăng ký
            </button>
          </>
        )}
        
        {!isAuthenticated && (
            <button className="btn btn-employer">
            Đăng tuyển & tìm hồ sơ
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;