// components/CompanyList.js
import React, { useState, useEffect } from 'react';
import companyService from '../services/companyService';
import '../css/CompanyList.css';

// CẤU HÌNH DOMAIN BACKEND (Sửa lại port nếu cần)
const BASE_API_URL = 'http://localhost:5000'; 

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho phân trang
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10; // Số lượng công ty mỗi trang

    useEffect(() => {
        fetchCompanies(page);
    }, [page]); // Mỗi khi 'page' thay đổi sẽ gọi lại API

    const fetchCompanies = async (pageNumber) => {
        setLoading(true);
        try {
            // Gọi service với tham số page và limit
            const response = await companyService.getAllCompanies(pageNumber, LIMIT);
            
            // Debug: In ra để xem cấu trúc logo
            console.log("Dữ liệu API trả về:", response);

            if (response && response.data) {
                setCompanies(response.data);
                // Cập nhật tổng số trang từ pagination
                setTotalPages(response.pagination?.totalPages || 1);
            } else {
                setCompanies([]);
            }
        } catch (error) {
            console.error("Lỗi tải công ty:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM XỬ LÝ URL LOGO (Sửa lỗi logo vẫn cũ) ---
    const getLogoUrl = (company) => {
        // 1. Tìm trường chứa logo (Ưu tiên các tên thường gặp)
        // Dựa vào log của bạn, có vẻ logo nằm trong biến object tên là 'image' hoặc 'logo'
        const logoData = company.logo || company.image || company.logo_company_url;

        if (!logoData) return null;

        // 2. Xử lý nếu logo là một Object (Lỗi bạn đang gặp)
        // Ví dụ: { type: "uploaded file", fileName: "image_abc.png" }
        let fileName = logoData;
        if (typeof logoData === 'object' && logoData.fileName) {
            fileName = logoData.fileName;
        }

        // 3. Nếu là đường dẫn online (http) thì trả về luôn
        if (typeof fileName === 'string' && fileName.startsWith('http')) {
            return fileName;
        }

        // 4. Nếu là tên file, nối thêm domain backend
        // Lưu ý: Đường dẫn '/uploads/' phải khớp với folder static trên server Nodejs/Springboot
        return `${BASE_API_URL}/uploads/${fileName}`;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (loading) return <div className="loading-container">Đang tải...</div>;

    return (
        <div className="company-page">
            <div className="company-container">
                <div className="page-header">
                    <h1>Nhà tuyển dụng hàng đầu</h1>
                    <p>Trang {page} / {totalPages}</p>
                </div>

                {companies.length === 0 ? (
                    <div className="no-data">Không có dữ liệu.</div>
                ) : (
                    <>
                        {/* DANH SÁCH CÔNG TY */}
                        <div className="company-grid">
                            {companies.map((comp) => (
                                <div key={comp.id} className="company-card">
                                    <div className="company-logo-wrapper">
                                        <img 
                                            src={getLogoUrl(comp) || `https://placehold.co/100x100?text=${comp.name.charAt(0)}`} 
                                            alt={comp.name}
                                            className="company-logo"
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = "https://placehold.co/100x100?text=No+Logo";
                                            }}
                                        />
                                    </div>
                                    <div className="company-info">
                                        <h3 className="company-name">{comp.name}</h3>
                                        <div className="company-meta">
                                            <span>🏢 {comp.type || 'N/A'}</span>
                                            <span>👥 {comp.size || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="company-footer">
                                        <button className="btn-detail">Chi tiết</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* THANH PHÂN TRANG (PAGINATION) */}
                        <div className="pagination-controls">
                            <button 
                                disabled={page === 1} 
                                onClick={() => handlePageChange(page - 1)}
                                className="btn-page"
                            >
                                « Trước
                            </button>

                            {/* Hiển thị số trang */}
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                // Chỉ hiện các trang gần trang hiện tại để đỡ dài
                                if (Math.abs(page - pageNum) <= 2 || pageNum === 1 || pageNum === totalPages) {
                                     return (
                                        <button
                                            key={pageNum}
                                            className={`btn-page ${page === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button 
                                disabled={page === totalPages} 
                                onClick={() => handlePageChange(page + 1)}
                                className="btn-page"
                            >
                                Sau »
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyList;