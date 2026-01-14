import React, { useEffect, useState } from 'react';
// CHỈ import các hàm liên quan đến cá nhân
import { getMyProfile, updateMyProfile } from '../services/profileService';
import { ROLE_ID } from '../utils/roles';
import '../css/profile.css'; // Dùng lại đúng file CSS cũ của bạn

const getFileName = (url) => {
  try {
    const fileName = decodeURIComponent(url.split('/').pop());
    return fileName.split('_').slice(1).join('_') || fileName;
  } catch {
    return 'File';
  }
};

const Profile = () => {
  const [userRole, setUserRole] = useState(null);
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [editData, setEditData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [cvFiles, setCvFiles] = useState([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        setUserRole(storedUser.role_id);
        fetchData();
    } else {
        setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      // QUAN TRỌNG: Luôn gọi getMyProfile cho cả Employer lẫn Candidate
      // Vì đây là trang thông tin cá nhân
      const data = await getMyProfile();
      setProfile(data);
      setAvatarPreview(data?.avatar_url || 'https://via.placeholder.com/150');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleEditClick = () => {
    // Nạp dữ liệu vào form sửa
    setEditData({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        dob: profile?.dob || '',
        // Các trường này ứng viên mới cần, nhưng cứ init để code sạch
        education: profile?.education || '',
        experience: profile?.experience || '',
        skills: profile?.skills || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setCvFiles([]);
    setAvatarPreview(profile?.avatar_url || 'https://via.placeholder.com/150');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCvChange = (e) => {
    const files = Array.from(e.target.files);
    setCvFiles(files);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Logic Save giống hệt nhau cho cả 2 Role
      const formData = new FormData();
      
      // 1. Text Data
      Object.entries(editData).forEach(([k, v]) => v && formData.append(k, v));
      
      // 2. Avatar
      if (avatarFile) formData.append('avatar', avatarFile);
      
      // 3. CV (Nếu là Employer thì mảng này rỗng, không ảnh hưởng gì)
      cvFiles.forEach((file) => formData.append('cv', file));

      const updated = await updateMyProfile(formData);
      setProfile(updated);
      setAvatarPreview(updated.avatar_url || avatarPreview);
      
      // Bắn event để Header cập nhật tên/avatar ngay lập tức
      window.dispatchEvent(new Event('profileUpdated'));
      
      alert('Cập nhật hồ sơ cá nhân thành công!');
      setIsEditing(false);
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="profile-loading">Đang tải dữ liệu...</div>;
  if (!profile) return <div className="profile-error">Không có dữ liệu hồ sơ</div>;

  const isEmployer = userRole === ROLE_ID.EMPLOYER;

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        {/* ===== CỘT TRÁI (SIDEBAR) ===== */}
        {/* Logic hiển thị Avatar và Tên giống hệt nhau cho cả 2 Role */}
        <div className="profile-sidebar">
            <div className="avatar-wrapper">
                {isEditing ? (
                    <label className="avatar-label-edit">
                        <img src={avatarPreview} className="profile-avatar editing" alt="Avatar" />
                        <div className="camera-overlay"><span>📷 Đổi ảnh</span></div>
                        <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                    </label>
                ) : (
                    <img src={avatarPreview} className="profile-avatar" alt="Avatar" />
                )}
            </div>
            
            <div style={{width: '100%', textAlign: 'center'}}>
                {isEditing ? (
                    <div style={{marginBottom: '10px'}}>
                         <input 
                            className="edit-input name-input" // Dùng class edit-input của css cũ
                            name="full_name" 
                            value={editData.full_name} 
                            onChange={handleChange} 
                            placeholder="Họ và tên"
                            style={{textAlign: 'center', fontWeight: 'bold'}}
                        />
                    </div>
                ) : (
                    <h2 className="profile-name">{profile.full_name || 'Người dùng'}</h2>
                )}
                
                <p className="profile-email">{profile.email}</p>
                
                {/* Badge phân biệt Role cho đẹp */}
                <div style={{marginBottom: '15px'}}>
                     <span style={{
                         padding: '4px 10px', 
                         borderRadius: '12px', 
                         background: isEmployer ? '#e3f2fd' : '#e6f7ef',
                         color: isEmployer ? '#0d47a1' : '#00b14f',
                         fontSize: '12px', fontWeight: 'bold'
                     }}>
                         {isEmployer ? 'NHÀ TUYỂN DỤNG' : 'ỨNG VIÊN'}
                     </span>
                </div>
            </div>

            <hr className="divider" />

            {/* Thông tin liên hệ cơ bản */}
            <div className="contact-info">
                <div className="info-item">
                    <span className="info-icon">📞</span>
                    {isEditing ? (
                        <input className="edit-input" name="phone" value={editData.phone} onChange={handleChange} placeholder="Số điện thoại" />
                    ) : (
                        <span>{profile.phone || 'Chưa cập nhật SĐT'}</span>
                    )}
                </div>

                <div className="info-item">
                    <span className="info-icon">📍</span>
                    {isEditing ? (
                        <input className="edit-input" name="address" value={editData.address} onChange={handleChange} placeholder="Địa chỉ" />
                    ) : (
                        <span>{profile.address || 'Chưa cập nhật địa chỉ'}</span>
                    )}
                </div>

                <div className="info-item">
                    <span className="info-icon">🎂</span>
                    {isEditing ? (
                        <input className="edit-input" type="date" name="dob" value={editData.dob} onChange={handleChange} />
                    ) : (
                        <span>{profile.dob || 'Chưa cập nhật ngày sinh'}</span>
                    )}
                </div>
            </div>
        </div>

        {/* ===== CỘT PHẢI (CONTENT) ===== */}
        <div className="profile-content">
            <h2 className="section-title">Thông tin chi tiết</h2>

            {/* Nếu là ỨNG VIÊN: Hiện đầy đủ CV, Kỹ năng... */}
            {!isEmployer && (
                <>
                    <div className="section-block">
                        <h3 style={{fontSize:'16px', fontWeight:'600', marginBottom:'10px', color:'#555'}}>Học vấn</h3>
                        {isEditing ? (
                            <textarea className="edit-textarea" rows="3" name="education" value={editData.education} onChange={handleChange} placeholder="Đại học, chứng chỉ..." />
                        ) : (
                            <p className="text-content">{profile.education || 'Chưa cập nhật'}</p>
                        )}
                    </div>

                    <div className="section-block">
                        <h3 style={{fontSize:'16px', fontWeight:'600', marginBottom:'10px', color:'#555'}}>Kinh nghiệm làm việc</h3>
                        {isEditing ? (
                            <textarea className="edit-textarea" rows="4" name="experience" value={editData.experience} onChange={handleChange} placeholder="Mô tả kinh nghiệm..." />
                        ) : (
                            <p className="text-content">{profile.experience || 'Chưa cập nhật'}</p>
                        )}
                    </div>

                    <div className="section-block">
                        <h3 style={{fontSize:'16px', fontWeight:'600', marginBottom:'10px', color:'#555'}}>Kỹ năng</h3>
                        {isEditing ? (
                            <textarea className="edit-textarea" name="skills" value={editData.skills} onChange={handleChange} placeholder="Java, ReactJS, Teamwork..." />
                        ) : (
                            <div className="skills-list">
                                {profile.skills ? profile.skills.split(',').map((s, i) => (
                                    <span key={i} className="skill-tag">{s.trim()}</span>
                                )) : <span style={{color:'#999', fontStyle:'italic'}}>Chưa cập nhật kỹ năng</span>}
                            </div>
                        )}
                    </div>

                    <div className="section-block">
                        <h3 style={{fontSize:'16px', fontWeight:'600', marginBottom:'10px', color:'#555'}}>Hồ sơ đính kèm (CV)</h3>
                        {isEditing && (
                            <div className="file-upload-area">
                                <input type="file" multiple id="cv-upload" accept=".pdf,.doc,.docx" onChange={handleCvChange} className="file-input-hidden" />
                                <label htmlFor="cv-upload" className="btn-upload">📂 Chọn file CV</label>
                                {cvFiles.length > 0 && (
                                    <ul className="cv-preview-list">
                                        {cvFiles.map((file, i) => <li key={i}>🆕 {file.name}</li>)}
                                    </ul>
                                )}
                            </div>
                        )}

                        {profile.cv_url?.length > 0 ? (
                            <ul className="cv-list">
                                {profile.cv_url.map((cv, i) => (
                                    <li key={i} className="cv-item">
                                        <a href={cv} target="_blank" rel="noreferrer" className="cv-link">
                                            <span className="file-icon">📄</span> {getFileName(cv)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{color:'#999', fontStyle:'italic'}}>Chưa tải lên CV nào</p>
                        )}
                    </div>
                </>
            )}

            {/* Nếu là NHÀ TUYỂN DỤNG: Chỉ hiện một thông báo nhỏ (Vì họ không cần nhập CV) */}
            {isEmployer && (
                <div className="section-block">
                    <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00b14f'}}>
                        <p style={{marginBottom: '5px'}}>👋 Chào <b>{profile.full_name}</b>,</p>
                        <p>Đây là trang quản lý thông tin tài khoản cá nhân của bạn.</p>
                        <p>Để cập nhật thông tin về Công ty (Logo, Tên cty, Website...), vui lòng truy cập trang <b>"Công ty của tôi"</b>.</p>
                    </div>
                </div>
            )}

            {/* BUTTONS: Giống nhau cho cả 2 Role */}
            <div className="action-buttons">
                {isEditing ? (
                    <>
                        <button className="btn btn-save" onClick={handleSave}>Lưu thông tin</button>
                        <button className="btn btn-cancel" onClick={handleCancel}>Hủy</button>
                    </>
                ) : (
                    <button className="btn btn-edit-profile" onClick={handleEditClick}>
                        ✏️ Chỉnh sửa hồ sơ
                    </button>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;