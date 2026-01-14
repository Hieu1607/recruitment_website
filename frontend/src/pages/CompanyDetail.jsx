import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import companyService from '../services/companyService';
import jobService from '../services/jobService';
// Import file CSS bạn đã cung cấp
import '../css/CompanyDetail.css';

const BASE_API_URL = 'http://localhost:5000';

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                // 1. Lấy thông tin công ty
                const compData = await companyService.getCompanyById(id);
                setCompany(compData);

                // 2. Lấy danh sách việc làm của công ty
                if (compData) {
                    const jobsData = await jobService.getJobsByCompanyId(id);
                    setJobs(jobsData || []);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    // Hàm xử lý URL Logo
    const getLogoUrl = (comp) => {
        if (!comp) return "";
        
        // Link tạo avatar mặc định nếu không có logo
        const autoAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(comp.name)}&background=random&color=fff&size=200&font-size=0.5`;

        const logoData = comp.logo_company_url || comp.logo || comp.image;

        // Nếu không có dữ liệu logo -> Trả về Avatar tự tạo
        if (!logoData) return autoAvatar;
        
        // Nếu là link online (http/https) -> Trả về nguyên gốc
        if (typeof logoData === 'string' && logoData.startsWith('http')) return logoData;

        // Nếu là đường dẫn file nội bộ -> Ghép với Base URL
        const cleanPath = logoData.startsWith('/') ? logoData.substring(1) : logoData;
        return `${BASE_API_URL}/${cleanPath}`;
    };

    if (loading) return <div className="loading-spinner">Đang tải thông tin...</div>;
    if (!company) return <div className="not-found">Không tìm thấy công ty này.</div>;

    // Link dự phòng cho onError
    const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&color=fff&size=200&font-size=0.5`;

    return (
        <div className="company-detail-page">
            {/* Thêm style inline này để đẩy nội dung xuống khỏi Header cố định (nếu có) */}
            <div style={{ paddingTop: '80px' }}></div>

            {/* --- PHẦN HEADER THÔNG TIN --- */}
            <div className="company-header-section">
                <div className="cd-container">
                    <div className="header-content">
                        {/* Logo Wrapper */}
                        <div className="detail-logo-wrapper">
                            <img 
                                src={getLogoUrl(company)} 
                                alt={company.name} 
                                className="detail-logo" 
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = fallbackLogo;
                                }}
                            />
                        </div>

                        {/* Thông tin chính */}
                        <div className="detail-info">
                            <h1 className="detail-name">{company.name}</h1>
                            
                            <div className="detail-meta">
                                {company.type && <span className="meta-tag">🏢 {company.type}</span>}
                                <span className="meta-tag">👥 Quy mô: {company.size || 'N/A'}</span>
                                <span className="meta-tag">📍 {company.address || 'Chưa cập nhật địa chỉ'}</span>
                            </div>

                            {company.website && (
                                <a 
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="website-link"
                                >
                                    🌐 Truy cập website
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PHẦN NỘI DUNG CHÍNH (GRID 2 CỘT) --- */}
            <div className="cd-container main-content-grid">
                
                {/* CỘT TRÁI: GIỚI THIỆU */}
                <div className="left-col">
                    <div className="content-box">
                        <h3 className="section-title">Giới thiệu về công ty</h3>
                        <div className="description-text">
                            {company.description ? (
                                <p style={{whiteSpace: 'pre-line', lineHeight: '1.6', color: '#333'}}>
                                    {company.description}
                                </p>
                            ) : (
                                <p className="text-muted" style={{color: '#666', fontStyle: 'italic'}}>
                                    Chưa có mô tả chi tiết về công ty này.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: DANH SÁCH VIỆC LÀM */}
                <div className="right-col">
                    <div className="content-box">
                        <h3 className="section-title">Việc làm đang tuyển ({jobs.length})</h3>
                        
                        <div className="company-jobs-list">
                            {jobs.length > 0 ? (
                                jobs.map(job => (
                                    <div key={job.id} className="job-mini-card">
                                        <h4 
                                            onClick={() => navigate(`/jobs/${job.id}`)} 
                                            className="mini-job-title"
                                            title="Xem chi tiết việc làm"
                                        >
                                            {job.title}
                                        </h4>
                                        
                                        <div className="mini-job-meta">
                                            <span className="salary">💰 {job.salary}</span>
                                        </div>

                                        <div className="mini-job-footer">
                                            <span className="location">📍 {job.location}</span>
                                            <button 
                                                onClick={() => navigate(`/jobs/${job.id}`)} 
                                                className="btn-apply-small"
                                            >
                                                Ứng tuyển
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-jobs">
                                    <p>Hiện tại công ty chưa có tin tuyển dụng nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CompanyDetail;