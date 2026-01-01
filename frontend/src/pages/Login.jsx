import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import '../css/Login.css';

const Login = ({ goRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 
  const { login } = useAuth();   

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/*  BANNER */}
        <div className="auth-banner">
          <div className="banner-text">
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập để tiếp tục hành trình sự nghiệp của bạn</p>
          </div>
        </div>

        {/*  FORM */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Đăng nhập</h2>
            <p>Vui lòng nhập thông tin tài khoản</p>
          </div>

          {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
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

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-footer">
            Chưa có tài khoản? 
            <span
              className="auth-link"
              style={{ cursor: 'pointer', color: '#2563eb', marginLeft: '5px' }}
              onClick={goRegister || (() => navigate('/register'))}   
            >
              Đăng ký
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;