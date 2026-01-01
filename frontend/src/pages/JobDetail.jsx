import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import Header from '../components/Header';
import '../css/JobDetail.css'; // Chúng ta sẽ tạo file này ở bước sau

const JobDetail = () => {
    const { id } = useParams(); // Lấy ID từ trên đường dẫn URL
    const navigate = useNavigate();
    const { user } = useAuth(); // Lấy thông tin user hiện tại

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State quản lý Modal ứng tuyển
    const [showModal, setShowModal] = useState(false);
    const [cvFile, setCvFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Tải thông tin chi tiết công việc
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await jobService.getJobById(id);
                setJob(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    // 2. Xử lý khi bấm nút "Ứng tuyển ngay"
    const handleApplyClick = () => {
        // Kiểm tra xem đã đăng nhập chưa
        if (!user) {
            const confirmLogin = window.confirm("Bạn cần đăng nhập để ứng tuyển. Đi đến trang đăng nhập ngay?");
            if (confirmLogin) {
                // Chuyển hướng sang login
                navigate('/login');
            }
            return;
        }
        // Nếu đã đăng nhập thì hiện Modal nộp CV
        setShowModal(true);
    };

    // 3. Xử lý gửi CV lên Server
    const handleSubmitCV = async (e) => {
        e.preventDefault();
        
        if (!cvFile) {
            alert("Vui lòng chọn file CV của bạn!");
            return;
        }

        setIsSubmitting(true);
        try {
            await jobService.applyJob(id, cvFile);
            alert("Chúc mừng! Bạn đã ứng tuyển thành công.");
            setShowModal(false); // Đóng modal
            setCvFile(null);     // Reset file
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-text">Đang tải thông tin công việc...</div>;
    if (!job) return <div className="error-text">Không tìm thấy công việc này.</div>;

    return (
        <div className="job-detail-page">
            <Header isAuthenticated={!!user} user={user} />

            <div className="job-detail-container">
                {/* --- PHẦN HEADER CÔNG VIỆC --- */}
                <div className="job-header-card">
                    <h1 className="job-title-large">{job.title}</h1>
                    <p className="company-name-large">🏢 {job.companyName || "Công ty ẩn danh"}</p>
                    
                    <div className="job-meta-row">
                        <span className="meta-tag salary-tag">💰 {job.salary}</span>
                        <span className="meta-tag">📍 {job.location}</span>
                        <span className="meta-tag">⏳ Hạn: {job.deadline || "Không giới hạn"}</span>
                    </div>

                    <button className="btn-apply-now" onClick={handleApplyClick}>
                        Ứng tuyển ngay
                    </button>
                </div>

                {/* --- PHẦN NỘI DUNG CHI TIẾT --- */}
                <div className="job-body-card">
                    <div className="job-section">
                        <h3>Mô tả công việc</h3>
                        <p style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
                    </div>

                    <div className="job-section">
                        <h3>Yêu cầu ứng viên</h3>
                        <p style={{ whiteSpace: 'pre-line' }}>{job.requirements}</p>
                    </div>

                    <div className="job-section">
                        <h3>Quyền lợi</h3>
                        <p style={{ whiteSpace: 'pre-line' }}>{job.benefits}</p>
                    </div>
                </div>
            </div>

            {/* --- MODAL (CỬA SỔ BẬT LÊN) ĐỂ UPLOAD CV --- */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Nộp hồ sơ ứng tuyển</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmitCV}>
                            <div className="form-group">
                                <label>Vị trí:</label>
                                <input type="text" value={job.title} disabled className="input-readonly" />
                            </div>
                            
                            <div className="form-group">
                                <label>Người ứng tuyển:</label>
                                <input type="text" value={user.username || user.fullName || "User"} disabled className="input-readonly" />
                            </div>

                            <div className="form-group upload-area">
                                <label>Tải lên CV (PDF, DOCX):</label>
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setCvFile(e.target.files[0])}
                                    className="file-input"
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary">
                                    {isSubmitting ? "Đang gửi..." : "Gửi hồ sơ"}
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