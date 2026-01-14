import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyProfile, getMyCompany } from '../services/profileService'; 
import { ROLE_ID } from '../utils/roles'; 
import '../css/header.css'; 

const Header = ({ isAuthenticated, user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [userProfile, setUserProfile] = useState(null);

  // Biến check quyền
  const isEmployer = user?.role_id === ROLE_ID.EMPLOYER;

  useEffect(() => {
    const checkRequirements = async () => {
      if (!isAuthenticated) return;

      // --- LOGIC CHO NHÀ TUYỂN DỤNG ---
      if (isEmployer) {
        
        // BƯỚC 1: KIỂM TRA CÔNG TY TRƯỚC (QUAN TRỌNG NHẤT)
        try {
            const companyData = await getMyCompany();
            
            // Nếu chưa có công ty (Backend trả về null hoặc lỗi 404 đã handle thành null)
            if (!companyData) {
                // Chỉ thông báo và chuyển hướng nếu KHÔNG ĐANG Ở trang tạo công ty
                if (location.pathname !== '/employer/company') {
                    alert("⚠️ Bạn chưa có hồ sơ công ty.\nVui lòng nhập thông tin công ty để bắt đầu sử dụng!");
                    navigate('/employer/company');
                }
                return; // QUAN TRỌNG: Dừng lại ngay, không kiểm tra cá nhân nữa.
            }
        } catch (err) {
            // Dự phòng trường hợp lỗi mạng
            return; 
        }

        // BƯỚC 2: KIỂM TRA HỒ SƠ CÁ NHÂN (CHỈ CHẠY KHI ĐÃ CÓ CÔNG TY)
        try {
            const profileData = await getMyProfile();
            setUserProfile(profileData); // Lưu để hiển thị Avatar/Tên

            // Kiểm tra các trường quan trọng (Ví dụ: SĐT hoặc Địa chỉ bị thiếu)
            const isMissingInfo = !profileData?.phone || !profileData?.address;

            if (isMissingInfo) {
                if (location.pathname !== '/profile') {
                    alert("⚠️ Hồ sơ cá nhân của bạn còn thiếu (SĐT, Địa chỉ).\nVui lòng cập nhật đầy đủ thông tin liên hệ!");
                    navigate('/profile');
                }
            }
        } catch (error) {
            console.error("Lỗi lấy profile:", error);
        }

      } else {
        // --- LOGIC CHO ỨNG VIÊN (ROLE KHÁC) ---
        // Chỉ lấy profile để hiện tên/avatar, không bắt buộc redirect (hoặc tùy bạn thêm)
        try {
            const data = await getMyProfile();
            setUserProfile(data);
        } catch (e) { console.error(e); }
      }
    };

    checkRequirements();

    // Lắng nghe sự kiện khi user cập nhật xong để load lại header
    const handleProfileUpdate = () => checkRequirements();
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [isAuthenticated, isEmployer, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    setUserProfile(null);
    navigate('/');
  };

  // --- HIỂN THỊ ---
  const displayName = userProfile?.full_name || user?.fullName || user?.full_name || 'User'; 
  const displayAvatar = userProfile?.avatar_url || 'https://placehold.co/150';

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/')}>JobCV</div>
        
        <nav className="nav-menu">
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

            <div className="user-info-area" onClick={() => navigate('/profile')}>
              <img
                src={displayAvatar}
                className="header-avatar"
                alt="Avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150'; }}
              />
              <span className="user-name">{displayName}</span>
            </div>

            <button className="btn btn-register btn-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        ) : (
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