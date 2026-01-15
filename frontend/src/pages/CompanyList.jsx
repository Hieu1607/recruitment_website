import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import companyService from '../services/companyService';
import '../css/CompanyList.css'; 

const BASE_API_URL = 'http://localhost:5000'; 

const CompanyList = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State phân trang
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10; 

    // [MỚI] State tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); // (Tùy chọn) Dùng để kích hoạt useEffect

    // Fetch khi page hoặc từ khóa tìm kiếm thay đổi (đã bấm enter/nút tìm)
    useEffect(() => {
        fetchCompanies(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch]);

    const fetchCompanies = async (pageNumber) => {
        setLoading(true);
        try {
            // [CẬP NHẬT] Truyền thêm debouncedSearch vào service
            const { data, pagination } = await companyService.getAllCompanies(pageNumber, LIMIT, debouncedSearch);
            
            setCompanies(Array.isArray(data) ? data : []);

            if (pagination && pagination.totalPages) {
                setTotalPages(pagination.totalPages);
            } else if (pagination && pagination.total) {
                setTotalPages(Math.ceil(pagination.total / LIMIT));
            }
        } catch (error) {
            console.error("Lỗi:", error);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    // [MỚI] Xử lý khi bấm tìm kiếm
    const handleSearch = () => {
        setPage(1); // Reset về trang 1 khi tìm kiếm mới
        setDebouncedSearch(searchTerm); // Kích hoạt useEffect
    };

    // [MỚI] Xử lý khi bấm Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
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

    return (
        <div className="company-page">
            <div className="company-container">
                <div className="page-header">
                    <h1>Nhà tuyển dụng hàng đầu</h1>
                    <p>Khám phá {companies.length}+ cơ hội nghề nghiệp từ các công ty uy tín</p>
                    
                    {/* [MỚI] Ô TÌM KIẾM */}
                    <div className="company-search-wrapper">
                        <input 
                            type="text" 
                            className="company-search-input"
                            placeholder="Nhập tên công ty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn-search-company" onClick={handleSearch}>
                            🔍 Tìm kiếm
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign:'center', padding:'40px'}}>Đang tải dữ liệu...</div>
                ) : companies.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px'}}>Không tìm thấy công ty nào phù hợp.</div>
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

                                    {/* INFO */}
                                    <div className="company-info">
                                        <h3 className="company-name">{comp.name}</h3>
                                        
                                        <div className="company-meta">
                                            {comp.type && (
                                                <span className="meta-badge" style={{background:'#e6f7ef', color:'#00b14f', border:'1px solid #d1fae5'}}>
                                                    🏢 {comp.type}
                                                </span>
                                            )}
                                            <span className="meta-badge">👥 {comp.size || 'N/A'}</span>
                                            {comp.address && (
                                                <span className="meta-badge">📍 {comp.address.split(',')[0]}</span>
                                            )}
                                        </div>

                                        <p className="company-desc" style={{
                                            fontSize:'13px', color:'#666', lineHeight:'1.5',
                                            margin:'10px 0',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '2', 
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {comp.description || 'Chưa có mô tả giới thiệu về công ty này.'}
                                        </p>

                                        <button 
                                            className="btn-view-detail"
                                            onClick={() => navigate(`/companies/${comp.id}`)}
                                        >
                                            Xem chi tiết
                                        </button>
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