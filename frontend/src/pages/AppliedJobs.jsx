import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import companyService from '../services/companyService'; // Import thêm service này
import CompanyName from '../components/CompanyName';
import '../css/AppliedJobs.css';

// --- HELPER: Xử lý đường dẫn ảnh ---
const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const BACKEND_URL = 'http://localhost:5000'; // Đổi cổng nếu backend khác 5000
    return `${BACKEND_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

// --- COMPONENT CON: ASYNC JOB CARD ---
const AsyncJobCard = ({ app, getStatusInfo }) => {
    const navigate = useNavigate();
    
    // 1. Khởi tạo state từ dữ liệu có sẵn trong prop 'app'
    const [jobInfo, setJobInfo] = useState({
        title: app.jobTitle || app.job?.title || "Đang tải...",
        companyId: app.companyId || app.job?.companyId || null,
        // Ưu tiên tìm logo ở mọi chỗ có thể trong dữ liệu ban đầu
        companyLogo: app.companyLogo || app.job?.companyLogo || app.job?.company?.logo_company_url || null,
        companyName: app.companyName || app.job?.companyName || "Company"
    });

    const jobId = app.jobId || app.job_id || app.job?.id || app.job;

    // 2. Logic "Bắc cầu": Tìm dữ liệu còn thiếu
    useEffect(() => {
        const fetchMissingData = async () => {
            let currentCompanyId = jobInfo.companyId;
            let currentLogo = jobInfo.companyLogo;

            // BƯỚC 1: Nếu thiếu Job Title hoặc Company ID -> Gọi API Job
            if (jobId && (!jobInfo.title || jobInfo.title === "Đang tải..." || !currentCompanyId)) {
                try {
                    const data = await jobService.getJobById(jobId);
                    if (data) {
                        setJobInfo(prev => ({
                            ...prev,
                            title: data.title || data.ten_cong_viec || prev.title,
                            companyId: data.companyId || data.company_id || prev.companyId,
                            companyName: data.companyName || prev.companyName
                        }));
                        currentCompanyId = data.companyId || data.company_id;
                    }
                } catch (error) {
                    console.error("Lỗi job:", jobId);
                }
            }

            // BƯỚC 2: Nếu có ID Công ty mà chưa có Logo -> Gọi API Company lấy 'logo_company_url'
            if (currentCompanyId && !currentLogo) {
                try {
                    const companyData = await companyService.getCompanyById(currentCompanyId);
                    // 👇 Lấy đúng trường trong API Docs bạn gửi
                    const realLogo = companyData?.logo_company_url;
                    const realName = companyData?.name;

                    if (realLogo || realName) {
                        setJobInfo(prev => ({
                            ...prev,
                            companyLogo: realLogo || prev.companyLogo,
                            companyName: realName || prev.companyName
                        }));
                    }
                } catch (error) {
                    console.error("Lỗi company:", currentCompanyId);
                }
            }
        };

        fetchMissingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    const statusInfo = getStatusInfo(app.status);
    const cvLink = normalizeUrl(app.cvUrl || app.cv_url);
    const dateString = app.applicationDate || app.created_at;
    const logoUrl = normalizeUrl(jobInfo.companyLogo);

    // --- LOGIC HIỂN THỊ LOGO HOẶC CHỮ CÁI ---
    const renderLogo = () => {
        if (logoUrl) {
            return (
                <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="company-logo-small"
                    onError={(e) => { e.target.style.display = 'none'; }} // Nếu ảnh lỗi thì ẩn đi để hiện chữ cái bên dưới
                />
            );
        }
        // Fallback: Tạo logo chữ cái (Ví dụ: "T" cho "Tech Solutions")
        const firstLetter = jobInfo.companyName ? jobInfo.companyName.charAt(0).toUpperCase() : "C";
        return (
            <div className="company-logo-placeholder" style={{
                width: '60px', height: '60px', backgroundColor: '#e0e7ff', color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '24px', borderRadius: '8px'
            }}>
                {firstLetter}
            </div>
        );
    };

    return (
        <div className="app-card">
            <div className="app-card-header">
                {/* Logo Area */}
                <div className="logo-wrapper">
                    {renderLogo()}
                </div>

                <div className="app-basic-info">
                    {/* Tên công việc */}
                    <h3 
                        onClick={() => jobId && navigate(`/jobs/${jobId}`)}
                        style={{ cursor: 'pointer', color: '#2563eb' }}
                    >
                        {jobInfo.title}
                    </h3>

                    {/* Tên công ty */}
                    <div className="company-name" style={{ fontWeight: '500', color: '#555' }}>
                        {jobInfo.companyId ? (
                            <CompanyName id={jobInfo.companyId} initialName={jobInfo.companyName} />
                        ) : (
                            <span>{jobInfo.companyName}</span>
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
                            <a href={cvLink} target="_blank" rel="noopener noreferrer" className="cv-link">
                                Xem hồ sơ
                            </a>
                        ) : <span className="text-muted">Không tìm thấy file</span>}
                    </span>
                </div>
            </div>

            <div className="app-card-footer">
                <button 
                    className="btn-detail"
                    onClick={() => jobId && navigate(`/jobs/${jobId}`)}
                    disabled={!jobId}
                >
                    Xem lại tin
                </button>
                {/* Kiểm tra đúng status 'offered' của API */}
                {(String(app.status).toLowerCase() === 'offered' || 
                  String(app.status).toLowerCase() === 'accepted') && (
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
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppliedJobs();
    }, []);

    const getStatusInfo = (status) => {
        const s = status ? String(status).toLowerCase() : '';
        switch (s) {
            case 'rejected': return { label: 'Đã từ chối', className: 'badge-rejected', icon: '❌' };
            case 'offered': 
            case 'accepted': return { label: 'Được nhận', className: 'badge-accepted', icon: '🎉' };
            case 'interview_scheduled': return { label: 'Phỏng vấn', className: 'badge-reviewing', icon: '💬' };
            case 'under_review': 
            case 'reviewing': return { label: 'Đang xem xét', className: 'badge-reviewing', icon: '👀' };
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
                        <button className="btn-find-now" onClick={() => navigate('/')}>Tìm việc ngay</button>
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