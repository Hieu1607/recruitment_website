import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
// 1. Import service lấy profile
import { getMyProfile } from '../services/profileService'; 
import '../css/JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Thêm state để chứa danh sách CV lấy từ API
  const [cvList, setCvList] = useState([]); 
  const [loadingProfile, setLoadingProfile] = useState(false);

  /* ================= LOAD JOB DETAIL ================= */
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
      } catch (error) {
        console.error('Lỗi tải job:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  /* ================= APPLY CLICK (SỬA LẠI ĐOẠN NÀY) ================= */
  const handleApplyClick = async () => {
    // 1. Kiểm tra đăng nhập
    if (!user) {
      if (window.confirm('Bạn cần đăng nhập để ứng tuyển. Đăng nhập ngay?')) {
        navigate('/login');
      }
      return;
    }

    // 2. Hiển thị modal và bật loading
    setShowModal(true);
    setLoadingProfile(true);

    try {
      // 3. Gọi API lấy Profile mới nhất để có danh sách CV
      const profileData = await getMyProfile();
      
      // Kiểm tra xem có CV không
      if (profileData && profileData.cv_url && Array.isArray(profileData.cv_url)) {
        setCvList(profileData.cv_url);
        // Tự động chọn CV đầu tiên nếu có
        if (profileData.cv_url.length > 0) {
            setSelectedCV(profileData.cv_url[0]);
        }
      } else {
        setCvList([]);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin Profile:", error);
      setCvList([]);
    } finally {
      setLoadingProfile(false);
    }
  };

  /* ================= SUBMIT APPLICATION ================= */
  const handleSubmitCV = async (e) => {
    e.preventDefault();

    if (!selectedCV) {
      alert('Vui lòng chọn 1 CV để ứng tuyển');
      return;
    }

    setIsSubmitting(true);
    try {
      // Logic ứng tuyển (có thể cần truyền thêm coverLetter nếu API hỗ trợ)
      await jobService.applyJob(job.id, { cvUrl: selectedCV, coverLetter }); 
      
      alert('✅ Ứng tuyển thành công!');
      setShowModal(false);
      setSelectedCV('');
      setCoverLetter('');
    } catch (error) {
      if (error.response?.status === 409) {
        alert('⚠️ Bạn đã ứng tuyển công việc này rồi');
      } else {
        console.error(error);
        alert('❌ Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-text">Đang tải...</div>;
  if (!job) return <div className="error-text">Không tìm thấy công việc</div>;

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        {/* ================= HEADER ================= */}
        <div className="job-header-card">
          <h1 className="job-title-large">{job.title}</h1>
          <p className="company-name-large">
            🏢 {job.companyName || 'Công ty ẩn danh'}
          </p>

          <div className="job-meta-row">
            <span className="meta-tag salary-tag">💰 {job.salary}</span>
            <span className="meta-tag">📍 {job.location}</span>
            <span className="meta-tag">
              ⏳ Hạn: {job.deadline || 'Mở'}
            </span>
          </div>

          <button className="btn-apply-now" onClick={handleApplyClick}>
            Ứng tuyển ngay
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="job-body-card">
          <div className="job-section">
            <h3>Mô tả công việc</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
          </div>

          <div className="job-section">
            <h3>Yêu cầu</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{job.requirements}</p>
          </div>

          <div className="job-section">
            <h3>Quyền lợi</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{job.benefits}</p>
          </div>
        </div>
      </div>

      {/* ================= MODAL APPLY ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nộp hồ sơ</h2>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitCV}>
              <div className="form-group">
                <label>Vị trí</label>
                <input
                  type="text"
                  value={job.title}
                  disabled
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={user?.fullName || 'Ứng viên'}
                  disabled
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>Chọn CV từ hồ sơ *</label>

                {/* Kiểm tra trạng thái loading profile */}
                {loadingProfile ? (
                    <p>⏳ Đang tải danh sách CV...</p>
                ) : (
                    <>
                        {cvList.length > 0 ? (
                        <div className="cv-list">
                            {cvList.map((cv, index) => {
                            // Logic lấy tên file đẹp hơn
                            const cvName = cv.split('/').pop().replace(/^\d+_/, ''); // Bỏ timestamp đầu file nếu có

                            return (
                                <label key={index} className="cv-item" style={{display: 'flex', gap: '10px', padding: '5px 0', cursor: 'pointer'}}>
                                <input
                                    type="radio"
                                    name="cv"
                                    value={cv}
                                    checked={selectedCV === cv}
                                    onChange={() => setSelectedCV(cv)}
                                />
                                <span>{decodeURIComponent(cvName)}</span>
                                </label>
                            );
                            })}
                        </div>
                        ) : (
                        <div style={{ color: 'red', marginTop: '5px' }}>
                            <p>⚠️ Bạn chưa có CV nào trong hồ sơ.</p>
                            <a href="/profile" style={{color: '#2563eb', textDecoration: 'underline'}}>👉 Cập nhật hồ sơ ngay</a>
                        </div>
                        )}
                    </>
                )}
              </div>

              <div className="form-group">
                <label>Thư giới thiệu (không bắt buộc)</label>
                <textarea
                  rows="3"
                  className="input-textarea"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Viết ngắn gọn lý do bạn ứng tuyển..."
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  // Disable nút gửi nếu đang gửi HOẶC không có CV
                  disabled={isSubmitting || cvList.length === 0}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;