import React, { useEffect, useState } from 'react';
import { 
    getMyProfile, 
    updateMyProfile, 
    getMyCompany, 
    createCompanyProfile, // Đảm bảo bạn đã thêm hàm này trong profileService.js
    updateCompanyProfile 
} from '../services/profileService';
import { ROLE_ID } from '../utils/roles';
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
  const [userRole, setUserRole] = useState(null);
  
  // State Ứng viên
  const [profile, setProfile] = useState(null); 
  
  // State Công ty
  const [company, setCompany] = useState(null); 
  const [companyId, setCompanyId] = useState(null); // Để check xem là Tạo mới hay Cập nhật

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form Data (Dùng chung cho cả 2 role khi edit)
  const [editData, setEditData] = useState({});
  
  // State riêng cho Ứng viên (File)
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [cvFiles, setCvFiles] = useState([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        setUserRole(storedUser.role_id);
        fetchData(storedUser.role_id);
    } else {
        setLoading(false);
    }
  }, []);

  const fetchData = async (roleId) => {
    try {
      if (roleId === ROLE_ID.EMPLOYER) {
          // --- LOGIC NHÀ TUYỂN DỤNG ---
          const data = await getMyCompany();
          if (data) {
              setCompany(data);
              setCompanyId(data.id); // Lưu ID để dùng cho lệnh PUT
          } else {
              setCompany({}); // Chưa có công ty
              setCompanyId(null); // Null nghĩa là sẽ dùng lệnh POST
          }
      } else {
          // --- LOGIC ỨNG VIÊN ---
          const data = await getMyProfile();
          setProfile(data);
          setAvatarPreview(data?.avatar_url || 'https://via.placeholder.com/150');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleEditClick = () => {
    if (userRole === ROLE_ID.EMPLOYER) {
        // Load data công ty vào form
        setEditData({
            name: company?.name || '',
            website: company?.website || '',
            phone: company?.phone || '', // Lưu ý: API cần trả về phone nếu muốn hiện
            address: company?.address || '',
            size: company?.size || '1-10', // Default size theo API doc
            description: company?.description || ''
        });
    } else {
        // Load data ứng viên
        setEditData({
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
            dob: profile?.dob || '',
            education: profile?.education || '',
            experience: profile?.experience || '',
            skills: profile?.skills || '',
        });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setCvFiles([]);
    if (profile) setAvatarPreview(profile.avatar_url || 'https://via.placeholder.com/150');
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
    if ((profile?.cv_url?.length || 0) + files.length > 5) {
      alert('Chỉ được tối đa 5 CV');
      return;
    }
    setCvFiles(files);
  };

  // --- HÀM LƯU QUAN TRỌNG ĐÃ SỬA ---
  const handleSave = async () => {
    setLoading(true);
    try {
      if (userRole === ROLE_ID.EMPLOYER) {
          // === LOGIC CHO CÔNG TY (Theo đúng API Doc) ===
          let updatedCompany;
          
          if (companyId) {
              // CASE 1: Đã có ID -> Gọi PUT /companies/:id
              updatedCompany = await updateCompanyProfile(companyId, editData);
              alert('Cập nhật thông tin công ty thành công!');
          } else {
              // CASE 2: Chưa có ID -> Gọi POST /companies
              updatedCompany = await createCompanyProfile(editData);
              setCompanyId(updatedCompany.id); // Cập nhật ID mới tạo
              alert('Tạo hồ sơ công ty thành công!');
          }
          
          setCompany(updatedCompany);

      } else {
          // === LOGIC CHO ỨNG VIÊN (Giữ nguyên) ===
          const formData = new FormData();
          Object.entries(editData).forEach(([key, value]) => {
            if (value) formData.append(key, value);
          });
          if (avatarFile) formData.append('avatar', avatarFile);
          cvFiles.forEach((file) => formData.append('cv', file));

          const updated = await updateMyProfile(formData);
          setProfile(updated);
          setAvatarPreview(updated.avatar_url || avatarPreview);
          window.dispatchEvent(new Event('profileUpdated'));
          alert('Cập nhật hồ sơ thành công!');
      }
      
      setIsEditing(false);
      setAvatarFile(null);
      setCvFiles([]);

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Lỗi khi lưu dữ liệu';
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) return <div className="profile-loading">Đang tải...</div>;

  // --- VIEW: NHÀ TUYỂN DỤNG ---
  if (userRole === ROLE_ID.EMPLOYER) {
      return (
        <div className="profile-container">
            <div className="profile-card">
                <div style={{width: '100%', padding: '20px'}}>
                    <h2 style={{borderBottom: '2px solid #00b14f', paddingBottom: '10px', marginBottom: '20px'}}>
                        Thông tin doanh nghiệp
                    </h2>
                    
                    {!isEditing ? (
                        <div>
                            {/* Nếu chưa có công ty thì hiện thông báo */}
                            {!companyId ? (
                                <div style={{textAlign:'center', color: '#666', margin: '30px 0'}}>
                                    <p>Bạn chưa cập nhật hồ sơ công ty.</p>
                                    <button className="btn btn-edit-profile" onClick={handleEditClick}>
                                        ➕ Tạo hồ sơ công ty ngay
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3>{company.name}</h3>
                                    <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noreferrer">{company.website || '---'}</a></p>
                                    <p><strong>Quy mô:</strong> {company.size} nhân viên</p>
                                    <p><strong>Địa chỉ:</strong> {company.address || '---'}</p>
                                    <hr/>
                                    <h5>Giới thiệu:</h5>
                                    <p style={{whiteSpace: 'pre-line'}}>{company.description || 'Chưa có mô tả'}</p>
                                    
                                    <button className="btn btn-edit-profile" onClick={handleEditClick} style={{marginTop: '20px'}}>
                                        ✏️ Chỉnh sửa thông tin
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        // Form Edit cho Company
                        <div className="employer-form">
                            <div className="form-group mb-3">
                                <label>Tên công ty <span className="text-danger">*</span></label>
                                <input className="edit-input" name="name" value={editData.name} onChange={handleChange} placeholder="Nhập tên công ty..." />
                            </div>
                            <div className="row">
                                <div className="col-md-6 form-group mb-3">
                                    <label>Website</label>
                                    <input className="edit-input" name="website" value={editData.website} onChange={handleChange} placeholder="https://..." />
                                </div>
                                <div className="col-md-6 form-group mb-3">
                                    <label>Quy mô</label>
                                    <select className="edit-input" name="size" value={editData.size} onChange={handleChange} style={{width:'100%', padding:'10px'}}>
                                        <option value="1-10">1-10</option>
                                        <option value="11-50">11-50</option>
                                        <option value="51-200">51-200</option>
                                        <option value="201-500">201-500</option>
                                        <option value="501-1000">501-1000</option>
                                        <option value="1001-5000">1001-5000</option>
                                        <option value="5000+">5000+</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label>Địa chỉ</label>
                                <input className="edit-input" name="address" value={editData.address} onChange={handleChange} />
                            </div>
                            <div className="form-group mb-3">
                                <label>Giới thiệu công ty</label>
                                <textarea className="edit-textarea" rows="5" name="description" value={editData.description} onChange={handleChange}></textarea>
                            </div>

                            <div className="action-buttons">
                                <button className="btn btn-save" onClick={handleSave}>
                                    {companyId ? 'Lưu thay đổi' : 'Tạo mới'}
                                </button>
                                <button className="btn btn-cancel" onClick={handleCancel}>Hủy</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- VIEW: ỨNG VIÊN (FULL CODE) ---
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

          {/* THÔNG TIN LIÊN HỆ */}
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
                
                {cvFiles.length > 0 && (
                  <ul className="cv-preview-list">
                    {cvFiles.map((file, i) => (
                      <li key={i} className="new-file">🆕 {file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

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