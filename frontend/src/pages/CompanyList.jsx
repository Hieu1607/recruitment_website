// src/pages/CompanyList.jsx
import React, { useState, useEffect } from 'react';
import companyService from '../services/companyService';
import '../css/CompanyList.css'; 

const BASE_API_URL = 'http://localhost:5000'; 

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10; 

    useEffect(() => {
        fetchCompanies(page);
    }, [page]);

    const fetchCompanies = async (pageNumber) => {
        setLoading(true);
        try {
            const response = await companyService.getAllCompanies(pageNumber, LIMIT);
            if (response && response.data) {
                const list = response.data.companies || response.data || [];
                setCompanies(list);
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                } else if (response.totalPages) {
                    setTotalPages(response.totalPages);
                }
            } else {
                setCompanies([]);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLogoUrl = (company) => {
        const logoData = company.logo_company_url || company.logo || company.image;
        if (!logoData) return null;
        if (typeof logoData === 'string' && logoData.startsWith('http')) return logoData;
        const cleanPath = logoData.startsWith('/') ? logoData.substring(1) : logoData;
        return `${BASE_API_URL}/${cleanPath}`;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    if (loading) return <div className="company-page" style={{textAlign:'center', paddingTop:'100px'}}>Đang tải...</div>;

    return (
        <div className="company-page">
            <div className="company-container">
                <div className="page-header">
                    <h1>Nhà tuyển dụng hàng đầu</h1>
                    <p>Khám phá {companies.length}+ cơ hội nghề nghiệp từ các công ty uy tín</p>
                </div>

                {companies.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px'}}>Chưa có công ty nào.</div>
                ) : (
                    <>
                        <div className="company-grid">
                            {companies.map((comp) => (
                                <div key={comp.id} className="company-list-item">
                                    
                                    {/* LOGO */}
                                    <div className="list-logo-wrapper">
                                        <img 
                                            src={getLogoUrl(comp) || `https://ui-avatars.com/api/?name=${comp.name}&background=random`} 
                                            alt={comp.name}
                                            className="list-logo-img"
                                            onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Logo";}}
                                        />
                                    </div>

                                    {/* INFO - ĐÃ THÊM LẠI TYPE VÀ DESCRIPTION */}
                                    <div className="company-info">
                                        <h3 className="company-name">{comp.name}</h3>
                                        
                                        <div className="company-meta">
                                            {/* Loại hình công ty (nếu có) */}
                                            {comp.type && (
                                                <span className="meta-badge" style={{background:'#e6f7ef', color:'#00b14f', border:'1px solid #d1fae5'}}>
                                                    🏢 {comp.type}
                                                </span>
                                            )}
                                            
                                            {/* Quy mô */}
                                            <span className="meta-badge">
                                                👥 {comp.size || 'N/A'}
                                            </span>

                                            {/* Địa chỉ (Chỉ lấy tỉnh/thành phố đầu tiên cho gọn) */}
                                            {comp.address && (
                                                <span className="meta-badge">
                                                    📍 {comp.address.split(',')[0]}
                                                </span>
                                            )}
                                        </div>

                                        {/* Mô tả ngắn */}
                                        <p className="company-desc" style={{
                                            fontSize:'13px', color:'#666', lineHeight:'1.5',
                                            margin:'10px 0',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '2', // Giới hạn 2 dòng
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {comp.description || 'Chưa có mô tả giới thiệu về công ty này.'}
                                        </p>

                                        <button className="btn-view-detail">Xem chi tiết</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* PHÂN TRANG */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} className="btn-pagi">«</button>
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (Math.abs(page - p) <= 2 || p === 1 || p === totalPages) {
                                        return <button key={p} className={`btn-pagi ${page === p ? 'active' : ''}`} onClick={() => handlePageChange(p)}>{p}</button>;
                                    }
                                    return null;
                                })}
                                <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)} className="btn-pagi">»</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyList;