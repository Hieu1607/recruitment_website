import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- SỬA LẠI ĐƯỜNG DẪN IMPORT (Chỉ dùng ../) ---
import { getMyProfile } from '../services/profileService'; 
import { ROLE_ID } from '../utils/roles'; 
// ------------------------------------------------
import '../css/header.css'; 

const Header = ({ isAuthenticated, user, logout }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        try {
          const data = await getMyProfile();
          if (data) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error("Không lấy được profile:", error);
        }
      }
    };

    fetchProfile();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setUserProfile(null);
    navigate('/');
  };

  // --- LOGIC HIỂN THỊ THÔNG TIN ---
  const displayName = userProfile?.full_name || user?.fullName || user?.full_name || 'User'; 
  const displayAvatar = userProfile?.avatar_url || 'https://placehold.co/150';

  // Kiểm tra quyền
  const isEmployer = user?.role_id === ROLE_ID.EMPLOYER;

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/')}>JobCV</div>
        
        <nav className="nav-menu">
          {/* MENU DÀNH CHO NHÀ TUYỂN DỤNG */}
          {isAuthenticated && isEmployer ? (
            <>
              <span className="nav-item" onClick={() => navigate('/employer/company')}>
                Công ty của tôi
              </span>
              <span className="nav-item" onClick={() => navigate('/employer/jobs')}>
                Quản lý tin tuyển dụng
              </span>
              <span className="nav-item" onClick={() => navigate('/employer/candidates')}>
                Tìm hồ sơ
              </span>
            </>
          ) : (
            /* MENU DÀNH CHO ỨNG VIÊN HOẶC KHÁCH */
            <>
              <span className="nav-item" onClick={() => navigate('/')}>Việc làm</span>
              <span className="nav-item" onClick={() => navigate('/create-cv')}>Tạo CV</span>
              <span className="nav-item" onClick={() => navigate('/companies')}>Công ty</span>
            </>
          )}
        </nav>
      </div>

      <div className="header-right">
        {isAuthenticated ? (
          <div className="authenticated-actions">
            
            {/* ACTION RIÊNG */}
            {isEmployer ? (
                 <button 
                    className="btn btn-employer" 
                    style={{marginRight: '15px', padding: '8px 15px', fontSize: '14px'}}
                    onClick={() => navigate('/employer/post-job')}
                 >
                    + Đăng tin mới
                 </button>
            ) : (
                <span className="applied-jobs-link" onClick={() => navigate('/applied-jobs')}>
                    Vị trí đã ứng tuyển
                </span>
            )}

            {/* AVATAR & USER INFO */}
            <div className="user-info-area" onClick={() => navigate('/profile')}>
              <img
                src={displayAvatar}
                className="header-avatar"
                alt="Avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/150';
                }}
              />
              <span className="user-name">{displayName}</span>
            </div>

            <button className="btn btn-register btn-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          /* CHƯA ĐĂNG NHẬP */
          <>
            <button className="btn btn-login" onClick={() => navigate('/login')}>
              Đăng nhập
            </button>
            <button className="btn btn-register" onClick={() => navigate('/register')}>
              Đăng ký
            </button>
            <button className="btn btn-employer" onClick={() => navigate('/register')}>
                Đăng tuyển & tìm hồ sơ
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;