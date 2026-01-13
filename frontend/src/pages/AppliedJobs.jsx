import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import '../css/AppliedJobs.css';

const AppliedJobs = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const data = await jobService.getAppliedJobs();
                setApplications(data || []); 
            } catch (error) {
                console.error("Lỗi tải lịch sử ứng tuyển:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppliedJobs();
    }, []);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { label: 'Đang chờ', className: 'badge-pending', icon: '⏳' };
            case 'REVIEWING': return { label: 'Đang xem xét', className: 'badge-reviewing', icon: '👀' };
            case 'ACCEPTED': return { label: 'Được nhận', className: 'badge-accepted', icon: '✅' };
            case 'REJECTED': return { label: 'Từ chối', className: 'badge-rejected', icon: '❌' };
            default: return { label: 'Đang chờ', className: 'badge-pending', icon: '⏳' };
        }
    };

    if (loading) return <div className="loading-spinner">Đang tải dữ liệu...</div>;

    return (
        <div className="applied-page">
            <div className="applied-container">
                <div className="page-header">
                    <h1>Lịch sử ứng tuyển</h1>
                    <p>Theo dõi trạng thái các hồ sơ bạn đã gửi</p>
                </div>

                {applications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>Bạn chưa ứng tuyển công việc nào</h3>
                        <p>Hãy tìm kiếm cơ hội việc làm tốt nhất dành cho bạn ngay hôm nay.</p>
                        <button className="btn-find-now" onClick={() => navigate('/')}>
                            Tìm việc ngay
                        </button>
                    </div>
                ) : (
                    <div className="application-grid">
                        {applications.map((app) => {
                            const statusInfo = getStatusInfo(app.status);
                            
                            // ⚠️ LƯU Ý: Thay 'app.cv_url' bằng tên trường chính xác từ API của bạn
                            // Ví dụ: app.cv_path, app.resume_link, v.v.
                            const cvLink = app.cv_url || app.cv_file; 

                            return (
                                <div key={app.id} className="app-card">
                                    {/* --- HEADER: Logo, Tên Job, Công ty, Trạng thái --- */}
                                    <div className="app-card-header">
                                        <img 
                                            src={app.company_logo || "https://placehold.co/60x60?text=Logo"} 
                                            alt="Logo" 
                                            className="company-logo-small"
                                        />
                                        <div className="app-basic-info">
                                            <h3 onClick={() => navigate(`/jobs/${app.job_id || 1}`)}>{app.job_title}</h3>
                                            <p className="company-name">{app.company_name}</p>
                                        </div>
                                        <span className={`status-badge ${statusInfo.className}`}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>
                                    
                                    {/* --- BODY: Ngày nộp, File CV --- */}
                                    <div className="app-card-body">
                                        <div className="info-row">
                                            <span className="label">📅 Ngày nộp:</span>
                                            <span className="value">{new Date(app.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>

                                        {/* --- PHẦN MỚI THÊM: HIỂN THỊ FILE CV --- */}
                                        <div className="info-row">
                                            <span className="label">📄 CV đã gửi:</span>
                                            <span className="value">
                                                {cvLink ? (
                                                    <a 
                                                        href={cvLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="cv-link"
                                                    >
                                                        Xem hồ sơ
                                                    </a>
                                                ) : (
                                                    <span className="text-muted">Không tìm thấy file</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* --- FOOTER: Nút hành động --- */}
                                    <div className="app-card-footer">
                                        <button 
                                            className="btn-detail"
                                            onClick={() => navigate(`/jobs/${app.job_id || 1}`)}
                                        >
                                            Xem lại tin tuyển dụng
                                        </button>
                                        {app.status === 'ACCEPTED' && (
                                            <button className="btn-contact">Liên hệ HR</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppliedJobs;