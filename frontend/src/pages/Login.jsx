import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link để chuyển trang
import '../css/Login.css'; // Đảm bảo bạn đã có file CSS này

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Gọi hàm login từ AuthContext
      await login(email, password);
      navigate('/'); // Đăng nhập xong chuyển về trang chủ
    } catch (err) {
      // Xử lý lỗi hiển thị ra màn hình
      if (err.response && err.response.data && err.response.data.message) {
         setError(err.response.data.message);
      } else {
         setError('Email hoặc mật khẩu không đúng!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Phần Hình Ảnh */}
        <div className="auth-banner">
          <div className="banner-text">
            <h2>Chào mừng trở lại!</h2>
            <p>Kết nối với hàng ngàn cơ hội việc làm hấp dẫn.</p>
          </div>
        </div>

        {/* Phần Form */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Đăng Nhập</h2>
            <p>Vui lòng nhập thông tin tài khoản của bạn</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                className="form-input"
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
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          {/* 👇 NÚT CHUYỂN SANG TRANG ĐĂNG KÝ Ở ĐÂY 👇 */}
          <div className="auth-footer">
            Chưa có tài khoản? 
            <Link to="/register" className="auth-link">Tạo tài khoản mới</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;