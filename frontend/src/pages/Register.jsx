import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Bổ sung để điều hướng linh hoạt
import authService from '../services/authService';
import '../css/Login.css';

const Register = ({ goLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation cơ bản tại client
    if (password !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    if (password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự');
    }

    setLoading(true);
    try {
      await authService.register({
        fullName,
        email,
        password
      });

      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      
      // Ưu tiên goLogin từ props, nếu không có thì dùng navigate
      if (goLogin) {
        goLogin();
      } else {
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Email đã được đăng ký trên hệ thống');
      } else {
        setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* BÊN TRÁI: BANNER */}
        <div
          className="auth-banner"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
          }}
        >
          <div className="banner-text">
            <h2>Khởi đầu sự nghiệp</h2>
            <p>Tạo tài khoản để nhà tuyển dụng tìm thấy bạn</p>
          </div>
        </div>

        {/* BÊN PHẢI: FORM */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Đăng ký</h2>
            <p>Hoàn toàn miễn phí cho ứng viên</p>
          </div>

          {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="auth-footer">
            Đã có tài khoản?
            <span
              className="auth-link"
              style={{ cursor: 'pointer', color: '#2563eb', marginLeft: '5px' }}
              onClick={goLogin || (() => navigate('/login'))}
            >
              Đăng nhập
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;