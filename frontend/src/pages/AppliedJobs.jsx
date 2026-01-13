import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import '../css/AppliedJobs.css';

const AppliedJobs = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- DỮ LIỆU GIẢ ĐỂ TEST GIAO DIỆN (Xóa dòng này khi chạy thật) ---
    // const MOCK_DATA = [
    //     { id: 1, job_title: "Senior React Developer", company_name: "Tech Corp", status: "PENDING", created_at: "2023-10-20", company_logo: null },
    //     { id: 2, job_title: "Backend Node.js", company_name: "Fintech Asia", status: "REVIEWING", created_at: "2023-10-18", company_logo: null },
    //     { id: 3, job_title: "UI/UX Designer", company_name: "Creative Studio", status: "REJECTED", created_at: "2023-09-15", company_logo: null },
    //     { id: 4, job_title: "Project Manager", company_name: "Global Soft", status: "ACCEPTED", created_at: "2023-11-01", company_logo: null },
    // ];

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const data = await jobService.getAppliedJobs();
                setApplications(data || []); 
                
                // MỞ DÒNG DƯỚI NẾU MUỐN XEM GIAO DIỆN MẪU KHI CHƯA CÓ DATA THẬT
                // setApplications(MOCK_DATA); 
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

    if (loading) return <div className="loading-spinner">Is loading...</div>;

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
                            return (
                                <div key={app.id} className="app-card">
                                    <div className="app-card-header">
                                        <img 
                                            src={app.company_logo || "https://placehold.co/60x60?text=Logo"} 
                                            alt="Logo" 
                                            className="company-logo-small"
                                        />
                                        <div className="app-basic-info">
                                            <h3 onClick={() => navigate(`/jobs/${app.job_id || 1}`)}>{app.job_title}</h3>
                                            <p>{app.company_name}</p>
                                        </div>
                                        <span className={`status-badge ${statusInfo.className}`}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>
                                    
                                    <div className="app-card-body">
                                        <div className="info-row">
                                            <span className="label">Ngày nộp:</span>
                                            <span className="value">{new Date(app.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        {/* Bạn có thể thêm Lương hoặc Địa điểm vào đây nếu API trả về */}
                                    </div>

                                    <div className="app-card-footer">
                                        <button 
                                            className="btn-detail"
                                            onClick={() => navigate(`/jobs/${app.job_id || 1}`)}
                                        >
                                            Xem lại tin
                                        </button>
                                        {/* Nếu trạng thái là ACCEPTED thì hiện nút liên hệ */}
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