import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getMyProfile } from '../services/profileService'; 
import '../css/header.css';

const Header = ({ isAuthenticated, user, logout }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  // --- LOGIC CẬP NHẬT HEADER ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        const data = await getMyProfile();
        if (data) {
          setUserProfile(data);
        }
      }
    };

    // 1. Gọi ngay khi component mount (lần đầu vào trang)
    fetchProfile();

    // 2. Lắng nghe sự kiện "profileUpdated" từ trang Profile bắn sang
    const handleProfileUpdate = () => {
        fetchProfile();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // 3. Dọn dẹp sự kiện khi Header bị hủy
    return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
    };

  }, [isAuthenticated]); // Chạy lại nếu trạng thái login thay đổi

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  
  const handleLogout = () => {
    logout();
    setUserProfile(null);
    navigate('/'); 
  };

  const handleNavigateToApplied = () => navigate('/applied-jobs');
  const handleNavigateProfile = () => navigate('/profile');

  // Ưu tiên hiển thị dữ liệu mới nhất từ API (userProfile), fallback về props user
  const displayName = userProfile?.full_name || user?.full_name || 'User';
  const displayAvatar = userProfile?.avatar_url || 'https://via.placeholder.com/150';

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/')}>JobCV</div>
        <nav className="nav-menu">
          <span className="nav-item" onClick={() => navigate('/')}>Việc làm</span>
          <span className="nav-item">Tạo CV</span>
          <span className="nav-item">Công ty</span>
        </nav>
      </div>

      <div className="header-right">
        {isAuthenticated ? (
          <div className="authenticated-actions">
            <span className="applied-jobs-link" onClick={handleNavigateToApplied}>
                Vị trí đã ứng tuyển
            </span>

            <div className="user-info-area" onClick={handleNavigateProfile}>
                <img 
                    src={displayAvatar} 
                    alt="Avatar" 
                    className="header-avatar"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                />
                <span className="user-name">
                  {displayName}
                </span>
            </div>

            <button className="btn btn-register btn-logout" onClick={handleLogout}>
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