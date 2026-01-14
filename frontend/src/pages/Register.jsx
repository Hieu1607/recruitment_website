import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { ROLE_ID } from '../utils/roles'; 
import '../css/login.css'; 

const Register = () => {
  // --- State cho User ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLE_ID.JOB_SEEKER); 

  // --- State cho Company (Chỉ dùng khi role là Employer) ---
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate cơ bản cho Nhà tuyển dụng
      if (selectedRole === ROLE_ID.EMPLOYER) {
          if (!companyName.trim()) {
              alert("Vui lòng nhập tên công ty!");
              setLoading(false);
              return;
          }
      }

      // Gom dữ liệu công ty
      const companyData = selectedRole === ROLE_ID.EMPLOYER ? {
          name: companyName,
          address: companyAddress,
          website: companyWebsite,
          phone: companyPhone
      } : null;

      // Gọi API đăng ký
      await authService.register(email, password, fullName, selectedRole, companyData);
      
      // Vì Backend chưa lưu Company ngay lúc này, nên ta thông báo khéo:
      if (selectedRole === ROLE_ID.EMPLOYER) {
          alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập để hoàn thiện hồ sơ công ty.');
      } else {
          alert('Đăng ký thành công! Vui lòng đăng nhập.');
      }
      
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: selectedRole === ROLE_ID.EMPLOYER ? '900px' : '800px' }}>
        
        {/* Banner bên trái */}
        <div className="auth-banner">
          <div className="banner-text">
            <h2>{selectedRole === ROLE_ID.EMPLOYER ? 'Tìm kiếm nhân tài?' : 'Khởi đầu hành trình mới'}</h2>
            <p>{selectedRole === ROLE_ID.EMPLOYER 
                ? 'Đăng tin tuyển dụng và kết nối với hàng nghìn ứng viên tiềm năng.' 
                : 'Kết nối với hàng nghìn cơ hội việc làm ngay hôm nay.'}</p>
          </div>
        </div>

        {/* Form bên phải */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Đăng ký tài khoản</h2>
            <p>Chọn vai trò của bạn để bắt đầu</p>
          </div>

          {/* --- TABS CHỌN ROLE --- */}
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

          <form onSubmit={handleRegister}>
            {/* --- PHẦN THÔNG TIN TÀI KHOẢN (Chung cho cả 2) --- */}
            <h4 style={{marginTop: '15px', marginBottom: '10px', fontSize: '16px', color: '#555'}}>Thông tin đăng nhập</h4>
            
            <div className="form-group">
              <label>Họ và tên {selectedRole === ROLE_ID.EMPLOYER && "(Người liên hệ)"}</label>
              <input 
                type="text" 
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                placeholder={selectedRole === ROLE_ID.EMPLOYER ? "Ví dụ: Nguyễn Văn A - HR Manager" : "Nguyễn Văn A"}
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

            {/* --- PHẦN THÔNG TIN CÔNG TY (Chỉ hiện khi chọn Nhà tuyển dụng) --- */}
            {selectedRole === ROLE_ID.EMPLOYER && (
                <div className="company-info-section" style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
                    <h4 style={{marginBottom: '10px', fontSize: '16px', color: '#00b14f'}}>Thông tin công ty</h4>
                    
                    <div className="form-group">
                        <label>Tên công ty <span style={{color:'red'}}>*</span></label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required 
                            placeholder="Công ty Cổ phần Công nghệ..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại liên hệ</label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            placeholder="0987..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ công ty</label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            placeholder="Số 1, Đại Cồ Việt..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Website (nếu có)</label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>
            )}

            <button type="submit" className="auth-btn" disabled={loading} style={{marginTop: '20px'}}>
              {loading ? 'Đang xử lý...' : `Đăng ký ${selectedRole === ROLE_ID.EMPLOYER ? 'Nhà tuyển dụng' : 'Ứng viên'}`}
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