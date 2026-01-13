import React, { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../services/profileService';
import '../css/profile.css';

/* ================= UTIL ================= */
const getFileName = (url) => {
  try {
    const fileName = decodeURIComponent(url.split('/').pop());
    const parts = fileName.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : fileName;
  } catch {
    return 'CV';
  }
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [cvFiles, setCvFiles] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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
    setEditData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      dob: profile.dob || '',
      education: profile.education || '',
      experience: profile.experience || '',
      skills: profile.skills || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setCvFiles([]);
    setAvatarPreview(profile.avatar_url || 'https://via.placeholder.com/150');
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
    const currentCount = profile?.cv_url?.length || 0;

    if (files.length + currentCount > 5) {
      alert('Chỉ được tối đa 5 CV');
      return;
    }
    setCvFiles(files);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(editData).forEach(([key, value]) => {
        if (value !== '') formData.append(key, value);
      });

      if (avatarFile) formData.append('avatar', avatarFile);
      cvFiles.forEach((file) => formData.append('cv', file));

      const updated = await updateMyProfile(formData);

      setProfile(updated);
      setAvatarPreview(updated.avatar_url || avatarPreview);
      setIsEditing(false);
      setAvatarFile(null);
      setCvFiles([]);

      window.dispatchEvent(new Event('profileUpdated'));
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  // ... (Giữ nguyên phần import và logic phía trên)

  /* ================= RENDER ================= */
  if (loading && !profile) return <div className="profile-loading">Đang tải...</div>;
  if (!profile) return <div className="profile-error">Không có dữ liệu hồ sơ</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        {/* ===== CỘT TRÁI: AVATAR & THÔNG TIN CÁ NHÂN ===== */}
        <div className="profile-sidebar">
          <div className="avatar-wrapper">
            {isEditing ? (
              <label className="avatar-label-edit">
                <img src={avatarPreview} className="profile-avatar editing" alt="Avatar" />
                <div className="camera-overlay">
                    <span>📷 Đổi ảnh</span>
                </div>
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </label>
            ) : (
              <img src={avatarPreview} className="profile-avatar" alt="Avatar" />
            )}
          </div>

          <div className="sidebar-info">
            {isEditing ? (
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  className="edit-input name-input"
                  name="full_name"
                  value={editData.full_name}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <h2 className="profile-name">{profile.full_name || 'Chưa cập nhật tên'}</h2>
            )}
            <p className="profile-email">{profile.email}</p>
          </div>

          <hr className="divider" />

          {/* THÔNG TIN LIÊN HỆ (Phone, DOB, Address) */}
          <div className="contact-info">
            <div className="info-item">
              <span className="info-icon">📞</span>
              {isEditing ? (
                <input 
                    name="phone" placeholder="Số điện thoại" 
                    value={editData.phone} onChange={handleChange} className="edit-input" 
                />
              ) : (
                <span>{profile.phone || 'Chưa có SĐT'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-icon">🎂</span>
              {isEditing ? (
                <input 
                    type="date" name="dob" 
                    value={editData.dob} onChange={handleChange} className="edit-input" 
                />
              ) : (
                <span>{profile.dob || 'Chưa có ngày sinh'}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-icon">📍</span>
              {isEditing ? (
                <input 
                    name="address" placeholder="Địa chỉ" 
                    value={editData.address} onChange={handleChange} className="edit-input" 
                />
              ) : (
                <span>{profile.address || 'Chưa có địa chỉ'}</span>
              )}
            </div>
          </div>
        </div>

        {/* ===== CỘT PHẢI: NỘI DUNG CHUYÊN MÔN ===== */}
        <div className="profile-content">
          
          {/* 1. HỌC VẤN */}
          <div className="section-block">
            <h3 className="section-title">Học vấn</h3>
            {isEditing ? (
              <textarea
                className="edit-textarea"
                name="education"
                rows="3"
                placeholder="Trường đại học, bằng cấp..."
                value={editData.education}
                onChange={handleChange}
              />
            ) : (
              <p className="text-content">{profile.education || 'Chưa cập nhật thông tin học vấn'}</p>
            )}
          </div>

          {/* 2. KINH NGHIỆM */}
          <div className="section-block">
            <h3 className="section-title">Kinh nghiệm làm việc</h3>
            {isEditing ? (
              <textarea
                className="edit-textarea"
                name="experience"
                rows="4"
                placeholder="Mô tả kinh nghiệm làm việc của bạn..."
                value={editData.experience}
                onChange={handleChange}
              />
            ) : (
              <p className="text-content">{profile.experience || 'Chưa cập nhật kinh nghiệm'}</p>
            )}
          </div>

          {/* 3. KỸ NĂNG */}
          <div className="section-block">
            <h3 className="section-title">Kỹ năng</h3>
            {isEditing ? (
              <textarea
                className="edit-textarea"
                name="skills"
                rows="2"
                placeholder="Ví dụ: Java, React, Docker..."
                value={editData.skills}
                onChange={handleChange}
              />
            ) : (
              <div className="skills-list">
                {profile.skills
                  ? profile.skills.split(',').map((s, i) => (
                      <span key={i} className="skill-tag">{s.trim()}</span>
                    ))
                  : <span className="text-muted">Chưa có kỹ năng</span>}
              </div>
            )}
          </div>

          {/* 4. CV ĐÍNH KÈM */}
          <div className="section-block">
            <h3 className="section-title">Hồ sơ đính kèm (CV)</h3>
            
            {isEditing && (
              <div className="file-upload-area">
                <input
                  type="file"
                  multiple
                  id="cv-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  className="file-input-hidden"
                />
                <label htmlFor="cv-upload" className="btn-upload">
                    📂 Chọn file CV (Tối đa 5)
                </label>
                
                {/* Preview file mới chọn */}
                {cvFiles.length > 0 && (
                  <ul className="cv-preview-list">
                    {cvFiles.map((file, i) => (
                      <li key={i} className="new-file">🆕 {file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Danh sách CV hiện có */}
            {profile.cv_url?.length > 0 ? (
              <ul className="cv-list">
                {profile.cv_url.map((cv, i) => (
                  <li key={i} className="cv-item">
                    <a href={cv} target="_blank" rel="noreferrer" className="cv-link">
                      <span className="file-icon">📄</span> 
                      {getFileName(cv)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Chưa tải lên CV nào</p>
            )}
          </div>

          {/* 5. NÚT CHỨC NĂNG */}
          <div className="action-buttons">
            {isEditing ? (
              <>
                <button className="btn btn-save" onClick={handleSave} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button className="btn btn-cancel" onClick={handleCancel} disabled={loading}>Hủy</button>
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