// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../services/profileService';
import '../css/profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- State cho chế độ chỉnh sửa ---
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getMyProfile();
      if(data) {
        setProfile(data);
        setAvatarPreview(data.avatar_url || 'https://via.placeholder.com/150');
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Chuyển sang chế độ sửa
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

  // 3. Hủy bỏ sửa
  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(profile.avatar_url || 'https://via.placeholder.com/150'); // Reset về ảnh cũ
  };

  // 4. Xử lý nhập liệu text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 5. Xử lý chọn ảnh (Preview ngay lập tức)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 6. Lưu thay đổi
  const handleSave = async () => {
    setLoading(true);
    try {
        const formData = new FormData();
        
        // Đưa dữ liệu text vào formData
        Object.keys(editData).forEach(key => {
            formData.append(key, editData[key]);
        });

        // Đưa file ảnh vào formData (nếu có chọn ảnh mới)
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        const updatedProfile = await updateMyProfile(formData);
        
        if (updatedProfile) {
            setProfile(updatedProfile);
            setAvatarPreview(updatedProfile.avatar_url);
            setIsEditing(false);
            setAvatarFile(null);

            // --- QUAN TRỌNG: Báo cho Header biết để cập nhật lại ---
            window.dispatchEvent(new Event('profileUpdated'));
            // -------------------------------------------------------

            alert("Cập nhật thành công!");
        } else {
            alert("Cập nhật thất bại. Vui lòng kiểm tra lại.");
        }
    } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi lưu.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && !profile) return <div className="profile-loading">Đang tải thông tin...</div>;
  if (!profile && !loading) return <div className="profile-error">Không tìm thấy thông tin người dùng.</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        {/* --- CỘT TRÁI --- */}
        <div className="profile-sidebar">
          <div className="avatar-wrapper">
             {isEditing ? (
                <label className="avatar-label-edit">
                    <img 
                        src={avatarPreview} 
                        alt="User Avatar" 
                        className="profile-avatar editing"
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                    />
                    <div className="camera-icon">📷</div>
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </label>
             ) : (
                <img 
                    src={avatarPreview} 
                    alt="User Avatar" 
                    className="profile-avatar"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                />
             )}
          </div>

          {isEditing ? (
              <input 
                type="text" name="full_name" className="edit-input name-input" 
                value={editData.full_name} onChange={handleChange} placeholder="Nhập họ tên"
              />
          ) : (
              <h2 className="profile-name">{profile.full_name || 'Chưa cập nhật tên'}</h2>
          )}
          
          <div className="contact-info">
            <div className="info-item">
              <strong>Email:</strong> {profile.email || 'Chưa cập nhật'}
            </div>

            <div className="info-item">
              <strong>SĐT:</strong> 
              {isEditing ? (
                  <input type="text" name="phone" className="edit-input" value={editData.phone} onChange={handleChange} />
              ) : (
                  <span>{profile.phone || 'Chưa cập nhật'}</span>
              )}
            </div>

            <div className="info-item">
              <strong>Ngày sinh:</strong> 
              {isEditing ? (
                  <input type="date" name="dob" className="edit-input" value={editData.dob} onChange={handleChange} />
              ) : (
                  <span>{profile.dob || 'Chưa cập nhật'}</span>
              )}
            </div>

            <div className="info-item">
              <strong>Địa chỉ:</strong> 
              {isEditing ? (
                  <input type="text" name="address" className="edit-input" value={editData.address} onChange={handleChange} />
              ) : (
                  <span>{profile.address || 'Chưa cập nhật'}</span>
              )}
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI --- */}
        <div className="profile-content">
          <h3 className="section-title">Thông tin chuyên môn</h3>
          
          <div className="detail-group">
            <label>Học vấn</label>
            {isEditing ? (
                <textarea name="education" className="edit-textarea" rows="2" value={editData.education} onChange={handleChange} />
            ) : (
                <p>{profile.education || 'Chưa có thông tin'}</p>
            )}
          </div>

          <div className="detail-group">
            <label>Kinh nghiệm làm việc</label>
            {isEditing ? (
                <textarea name="experience" className="edit-textarea" rows="4" value={editData.experience} onChange={handleChange} />
            ) : (
                <p className="multiline-text">{profile.experience || 'Chưa có thông tin'}</p>
            )}
          </div>

          <div className="detail-group">
            {/* --- ĐÃ SỬA ĐOẠN NÀY --- */}
            <label>
                Kỹ năng 
                {isEditing && <span style={{fontWeight: 'normal', fontSize: '13px', color: '#666', marginLeft: '5px'}}>(ngăn cách bởi dấu phẩy)</span>}
            </label>
            {/* ----------------------- */}

            {isEditing ? (
                <textarea name="skills" className="edit-textarea" rows="2" value={editData.skills} onChange={handleChange} placeholder="Java, React..." />
            ) : (
                <div className="skills-list">
                    {profile.skills ? profile.skills.split(',').map((skill, index) => (
                        <span key={index} className="skill-tag">{skill.trim()}</span>
                    )) : 'Chưa có kỹ năng'}
                </div>
            )}
          </div>

          <div className="detail-group">
            <label>CV đính kèm</label>
            {profile.cv_url && profile.cv_url.length > 0 ? (
              <ul className="cv-list">
                {profile.cv_url.map((cv, index) => (
                  <li key={index}>
                    <a href={cv} target="_blank" rel="noopener noreferrer" className="cv-link">
                      📄 Xem CV số {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa tải lên CV nào.</p>
            )}
          </div>
          
          <div className="action-buttons">
              {isEditing ? (
                  <>
                    <button className="btn-save" onClick={handleSave} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button className="btn-cancel" onClick={handleCancel} disabled={loading}>Hủy</button>
                  </>
              ) : (
                  <button className="btn-edit-profile" onClick={handleEditClick}>Chỉnh sửa hồ sơ</button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;