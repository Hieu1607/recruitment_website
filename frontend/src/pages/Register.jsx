// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { ROLE_ID } from '../utils/roles'; 
import '../css/login.css'; // Đảm bảo import đúng file CSS vừa sửa

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Mặc định chọn Ứng viên
  const [selectedRole, setSelectedRole] = useState(ROLE_ID.JOB_SEEKER); 
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.register(email, password, fullName, selectedRole);
      
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        {/* Banner bên trái - Tự động ẩn trên mobile nhờ CSS */}
        <div className="auth-banner">
          <div className="banner-text">
            <h2>Khởi đầu hành trình mới</h2>
            <p>Kết nối với hàng nghìn cơ hội việc làm và ứng viên tiềm năng ngay hôm nay.</p>
          </div>
        </div>

        {/* Form bên phải */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Đăng ký tài khoản</h2>
            <p>Chọn vai trò của bạn để bắt đầu</p>
          </div>

          {/* --- TABS CHỌN ROLE (Đã khớp class với CSS mới) --- */}
          <div className="role-tabs">
            <div 
                className={`role-tab-btn ${selectedRole === ROLE_ID.JOB_SEEKER ? 'active' : ''}`}
                onClick={() => setSelectedRole(ROLE_ID.JOB_SEEKER)}
            >
                👤 Ứng viên
            </div>
            
            <div 
                className={`role-tab-btn ${selectedRole === ROLE_ID.EMPLOYER ? 'active' : ''}`}
                onClick={() => setSelectedRole(ROLE_ID.EMPLOYER)}
            >
                🏢 Nhà tuyển dụng
            </div>
          </div>
          {/* ----------------------------- */}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input 
                type="text" 
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                placeholder={selectedRole === ROLE_ID.EMPLOYER ? "Tên người liên hệ" : "Nguyễn Văn A"}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input 
                type="password" 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : `Đăng ký làm ${selectedRole === ROLE_ID.EMPLOYER ? 'Nhà tuyển dụng' : 'Ứng viên'}`}
            </button>
          </form>
          
          <div className="register-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;