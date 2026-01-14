import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import CompanyName from '../components/CompanyName'; // Import component hiển thị tên công ty
import '../css/AppliedJobs.css';

// --- COMPONENT THÔNG MINH: TỰ TÌM DỮ LIỆU CÒN THIẾU ---
const AsyncJobCard = ({ app, getStatusInfo }) => {
    const navigate = useNavigate();
    
    // Khởi tạo state với dữ liệu có sẵn (nếu có)
    const [jobInfo, setJobInfo] = useState({
        title: app.jobTitle || app.job?.title || "Đang tải...",
        companyId: app.companyId || app.job?.companyId || null,
        companyLogo: app.companyLogo || app.job?.companyLogo || null
    });

    const jobId = app.jobId || app.job_id || app.job?.id || app.job;

    // useEffect này đóng vai trò "Bắc cầu": 
    // Có Job ID -> Gọi API Job -> Lấy Job Title + Company ID -> Truyền cho component con
    useEffect(() => {
        // Chỉ gọi API nếu thiếu thông tin quan trọng (Title hoặc CompanyId)
        if (jobId && (!jobInfo.title || jobInfo.title === "Đang tải..." || !jobInfo.companyId)) {
            const fetchJobDetail = async () => {
                try {
                    const data = await jobService.getJobById(jobId);
                    if (data) {
                        setJobInfo(prev => ({
                            ...prev,
                            title: data.title || data.ten_cong_viec || "Vị trí không xác định",
                            // QUAN TRỌNG: Lấy CompanyID từ chi tiết job để lát nữa đưa vào thẻ CompanyName
                            companyId: data.companyId || data.company_id || data.id_cong_ty, 
                            companyLogo: data.companyLogo || prev.companyLogo
                        }));
                    }
                } catch (error) {
                    console.error("Lỗi lấy chi tiết job:", jobId);
                    setJobInfo(prev => ({ ...prev, title: "Không tìm thấy công việc" }));
                }
            };
            fetchJobDetail();
        }
    }, [jobId]);

    const statusInfo = getStatusInfo(app.status);
    const cvLink = app.cvUrl || app.cv_url; 
    const dateString = app.applicationDate || app.created_at;
    const displayLogo = jobInfo.companyLogo || "https://placehold.co/60x60?text=Logo";

    return (
        <div className="app-card">
            <div className="app-card-header">
                <img 
                    src={displayLogo} 
                    alt="Logo" 
                    className="company-logo-small"
                    onError={(e) => e.target.src = "https://placehold.co/60x60?text=Logo"}
                />
                <div className="app-basic-info">
                    {/* 1. HIỂN THỊ TÊN CÔNG VIỆC */}
                    <h3 
                        onClick={() => jobId && navigate(`/jobs/${jobId}`)}
                        style={{ cursor: 'pointer', color: '#2563eb' }}
                        title="Xem chi tiết"
                    >
                        {jobInfo.title}
                    </h3>

                    {/* 2. HIỂN THỊ TÊN CÔNG TY (Dựa vào Company ID vừa tìm được) */}
                    <div className="company-name" style={{ fontWeight: '500', color: '#555' }}>
                        {/* Nếu có Company ID, component này sẽ tự gọi API lấy tên chuẩn */}
                        {jobInfo.companyId ? (
                            <CompanyName id={jobInfo.companyId} initialName={null} />
                        ) : (
                            <span>Đang cập nhật...</span>
                        )}
                    </div>
                </div>
                <span className={`status-badge ${statusInfo.className}`}>
                    {statusInfo.icon} {statusInfo.label}
                </span>
            </div>
            
            <div className="app-card-body">
                <div className="info-row">
                    <span className="label">📅 Ngày nộp:</span>
                    <span className="value">
                        {dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                </div>
                <div className="info-row">
                    <span className="label">📄 CV đã gửi:</span>
                    <span className="value">
                        {cvLink ? (
                            <a 
                                href={cvLink.startsWith('http') ? cvLink : `http://localhost:8080${cvLink}`} 
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

            <div className="app-card-footer">
                <button 
                    className="btn-detail"
                    onClick={() => jobId && navigate(`/jobs/${jobId}`)}
                    disabled={!jobId}
                >
                    Xem lại tin tuyển dụng
                </button>
                {app.status === 'ACCEPTED' && (
                    <button className="btn-contact">Liên hệ HR</button>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
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
                        {applications.map((app, index) => (
                            <AsyncJobCard 
                                key={app.id || app._id || index} 
                                app={app} 
                                getStatusInfo={getStatusInfo}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppliedJobs;