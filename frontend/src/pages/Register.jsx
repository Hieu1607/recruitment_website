import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService'; 
import '../css/Login.css'; // Đảm bảo bạn import đúng file CSS

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validate password
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }
    if (formData.password.length < 6) {
        return setError('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    setLoading(true);
    try {
      // 2. CHUẨN BỊ DỮ LIỆU (Đã sửa lại dòng này)
      // Backend của bạn code là: const { fullName } = req.body;
      // Nên ở đây BẮT BUỘC phải gửi key là 'fullName' (không dùng full_name)
      const payload = {
        fullName: formData.fullName,  // <--- ĐÃ SỬA: full_name -> fullName
        email: formData.email,
        password: formData.password
        // roleName: 'Candidate' (Nếu backend cần role thì bỏ comment dòng này)
      };

      console.log("Dữ liệu gửi đi:", payload); // Log ra để kiểm tra

      // 3. Gọi API
      await authService.register(payload);
      
      // 4. Thành công
      if(window.confirm('Đăng ký thành công! Bạn có muốn đăng nhập ngay không?')) {
          navigate('/login');
      } else {
          navigate('/login');
      }
      
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      // Hiển thị thông báo lỗi chi tiết từ Backend trả về
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); 
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra kết nối.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Phần Hình Ảnh */}
        <div className="auth-banner" style={{backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"}}>
          <div className="banner-text">
            <h2>Khởi đầu sự nghiệp</h2>
            <p>Tạo hồ sơ ngay hôm nay để nhà tuyển dụng tìm thấy bạn.</p>
          </div>
        </div>

        {/* Phần Form */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Tạo tài khoản</h2>
            <p>Hoàn toàn miễn phí cho ứng viên</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input 
                name="fullName"
                type="text" 
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={formData.fullName} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                name="email"
                type="email" 
                className="form-input"
                placeholder="email@example.com"
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input 
                name="password"
                type="password" 
                className="form-input"
                placeholder="******"
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input 
                name="confirmPassword"
                type="password" 
                className="form-input"
                placeholder="******"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="auth-footer">
            Đã có tài khoản? 
            <Link to="/login" className="auth-link">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;