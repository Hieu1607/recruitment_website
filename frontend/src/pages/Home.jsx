import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // --- QUAN TRỌNG: Import hook điều hướng
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header.jsx';
import jobService from '../services/jobService';
import CompanyName from '../components/CompanyName';
import JobFilter from '../components/JobFilter';
import '../css/home.css';
import '../css/Pagination.css';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate(); // --- QUAN TRỌNG: Khởi tạo điều hướng
    const isAuthenticated = !!user;

    // --- State tìm kiếm ---
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('all');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // --- State bộ lọc ---
    const [advancedFilters, setAdvancedFilters] = useState({
        categories: [],
        level: 'Tất cả',
        salary: 'Tất cả',
        companyType: 'Tất cả'
    });

    // --- State dữ liệu ---
    const [popularKeywords, setPopularKeywords] = useState([]);
    const [suggestedJobs, setSuggestedJobs] = useState([]);
    const [jobResults, setJobResults] = useState([]);
    
    // Mặc định là true để hiển thị danh sách ngay lập tức
    const [hasSearched, setHasSearched] = useState(true); 
    const [loading, setLoading] = useState(true); 

    // --- State Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Tải cả gợi ý VÀ danh sách việc làm ngay khi vào trang
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Gọi song song cả 2 API
                const [suggestionData, allJobsData] = await Promise.all([
                    jobService.getSuggestions(),
                    jobService.getJobs('', 'all') // Lấy tất cả việc làm (nhờ limit 10000 bên service)
                ]);

                // Set dữ liệu gợi ý
                setPopularKeywords(suggestionData.keywords || []);
                setSuggestedJobs(suggestionData.jobs || []);

                // Set dữ liệu việc làm chính
                setJobResults(allJobsData || []);
                
            } catch (error) {
                console.error("Lỗi tải dữ liệu ban đầu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Hàm xử lý tìm kiếm (Khi người dùng bấm nút Tìm)
    const executeSearch = async (searchKeyword, searchLocation) => {
        setLoading(true);
        setHasSearched(true);
        setCurrentPage(1);

        try {
            const results = await jobService.getJobs(searchKeyword, searchLocation);
            setJobResults(results || []);
        } catch (error) {
            setJobResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchBtn = () => {
        setShowSuggestions(false);
        executeSearch(keyword, location);
    };

    const handleFilterChange = (newFilters) => {
        setAdvancedFilters(newFilters);
        if (!hasSearched) {
            executeSearch(keyword, location);
        }
        setCurrentPage(1);
    };

    // 3. Logic lọc dữ liệu (Filter Client-side)
    const filteredJobs = useMemo(() => {
        if (!jobResults.length) return [];

        return jobResults.filter(job => {
            let isMatch = true;

            // Lọc Mức lương
            if (advancedFilters.salary !== 'Tất cả') {
                const filterText = advancedFilters.salary.split(' ')[0];
                if (job.salary && !job.salary.includes(filterText) && job.salary !== 'Thỏa thuận') {
                    isMatch = false;
                }
                if (advancedFilters.salary === 'Thỏa thuận' && job.salary !== 'Thỏa thuận') {
                    isMatch = false;
                }
            }

            // Lọc Cấp bậc
            if (advancedFilters.level !== 'Tất cả') {
                if (job.level && job.level !== advancedFilters.level) {
                    isMatch = false;
                }
            }

            // Lọc Loại hình công ty
            if (advancedFilters.companyType && advancedFilters.companyType !== 'Tất cả') {
                if (job.companyType && !job.companyType.includes(advancedFilters.companyType)) {
                    isMatch = false;
                }
            }

            // Lọc Danh mục
            if (advancedFilters.categories.length > 0) {
                const titleLower = (job.title || '').toLowerCase();
                const hasCategoryMatch = advancedFilters.categories.some(cat =>
                    titleLower.includes(cat.toLowerCase())
                );
                if (!hasCategoryMatch) isMatch = false;
            }

            // Lọc Địa điểm
            if (location !== 'all') {
                const locLower = (job.location || '').toLowerCase();
                const filterLower = location.toLowerCase();
                let cityKey = "";

                if (filterLower === 'hanoi') cityKey = "hà nội";
                else if (filterLower === 'hcm') cityKey = "hồ chí minh";
                else if (filterLower === 'danang') cityKey = "đà nẵng";

                if (cityKey && !locLower.includes(cityKey)) isMatch = false;
            }

            return isMatch;
        });
    }, [jobResults, advancedFilters, location]);

    // 4. LOGIC PHÂN TRANG
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const formatLocation = (loc) => {
        if (!loc) return 'Toàn quốc';
        if (typeof loc !== 'string') return 'Việt Nam';
        try {
            return loc.includes(',') ? loc.split(',').slice(-1)[0].trim() : loc;
        } catch (e) { return loc; }
    };

    return (
        <div className="home-container">
            <Header isAuthenticated={isAuthenticated} user={user} logout={logout} />

            {/* --- HERO SECTION --- */}
            <div className="hero-section">
                <h1 className="hero-title">
                    <span style={{ color: '#60a5fa' }}>JopCV</span> - Tìm việc làm nhanh chóng
                </h1>

                <div className="search-container">
                    <div className="search-input-group">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text" className="search-input"
                            placeholder="Vị trí tuyển dụng, tên công ty..."
                            value={keyword} onChange={(e) => setKeyword(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                    </div>
                    <div className="divider"></div>
                    <div className="search-input-group" style={{ flex: 0.6 }}>
                        <span className="search-icon">📍</span>
                        <select className="search-input" value={location} onChange={(e) => setLocation(e.target.value)}>
                            <option value="all">Tất cả địa điểm</option>
                            <option value="hanoi">Hà Nội</option>
                            <option value="hcm">Hồ Chí Minh</option>
                            <option value="danang">Đà Nẵng</option>
                        </select>
                    </div>
                    <button className="search-btn" onClick={handleSearchBtn}>Tìm kiếm</button>

                    {/* Gợi ý Dropdown */}
                    {showSuggestions && (
                        <div className="search-suggestions">
                            <div className="suggestion-body">
                                <div className="suggestion-col-left">
                                    <div className="suggestion-title">Từ khóa phổ biến</div>
                                    <ul className="keyword-list">
                                        {popularKeywords.map((kw, i) => (
                                            <li key={i} className="keyword-item" onClick={() => setKeyword(kw)}>
                                                <span className="keyword-icon">↗</span> {kw}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="suggestion-col-right">
                                    <div className="suggestion-title">Việc làm mới nhất</div>
                                    {suggestedJobs.map((job, index) => (
                                        <div key={job.id || index} className="job-item" style={{ paddingLeft: 0 }}>
                                            <div className="job-info">
                                                {/* Thêm onClick chuyển trang ở đây cho phần gợi ý luôn */}
                                                <h4 
                                                    style={{ fontSize: '15px', color: '#2563eb', cursor: 'pointer' }}
                                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                                >
                                                    {job.title}
                                                </h4>
                                                <p style={{ fontWeight: '500' }}>
                                                    <CompanyName id={job.companyId} initialName={job.companyName} />
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="main-content">
                <div className="content-layout">

                    {/* Sidebar Filters */}
                    <div className="sidebar-wrapper">
                        <JobFilter onFilterChange={handleFilterChange} />
                    </div>

                    {/* Job List */}
                    <div className="job-list-wrapper">

                        {/* Loading */}
                        {loading && (
                            <div className="loading-text">Đang tải danh sách việc làm...</div>
                        )}

                        {/* Kết quả tìm kiếm & Danh sách mặc định */}
                        {!loading && (
                            <>
                                <h2 className="section-title">
                                    {keyword ? 'Kết quả tìm kiếm' : 'Tất cả việc làm'}
                                </h2>

                                <div className="job-grid">
                                    {currentJobs.length > 0 ? currentJobs.map((job, index) => (
                                        <div key={job.id || index} className="job-card">
                                            <div>
                                                {/* --- QUAN TRỌNG: SỰ KIỆN CLICK CHUYỂN TRANG --- */}
                                                <h3 
                                                    className="job-card-title"
                                                    style={{ cursor: 'pointer', color: '#2563eb' }}
                                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                                    title="Xem chi tiết"
                                                >
                                                    {job.title}
                                                </h3>
                                                
                                                <p className="job-card-company">
                                                    <span>🏢</span>
                                                    <CompanyName id={job.companyId} initialName={job.companyName} />
                                                </p>
                                                <div className="job-tags">
                                                    <span className="tag tag-salary">
                                                        💰 {job.salary}
                                                    </span>
                                                    <span className="tag tag-location">
                                                        📍 {formatLocation(job.location)}
                                                    </span>
                                                    {job.level && (
                                                        <span className="tag tag-level">
                                                            🎓 {job.level}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="no-result">
                                            <p>Không tìm thấy kết quả nào.</p>
                                        </div>
                                    )}
                                </div>

                                {/* THANH PHÂN TRANG */}
                                {filteredJobs.length > 0 && (
                                    <div className="pagination-container">
                                        <button
                                            className="pagination-btn"
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Trước
                                        </button>

                                        {(() => {
                                            const pageNumbers = [];
                                            if (totalPages <= 7) {
                                                for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
                                            } else {
                                                if (currentPage <= 4) {
                                                    pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages);
                                                } else if (currentPage >= totalPages - 3) {
                                                    pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                                } else {
                                                    pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                                }
                                            }

                                            return pageNumbers.map((number, index) => {
                                                if (number === '...') {
                                                    return (
                                                        <span key={`ellipsis-${index}`} className="pagination-ellipsis" style={{ padding: '0 10px' }}>
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={number}
                                                        className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                                                        onClick={() => paginate(number)}
                                                    >
                                                        {number}
                                                    </button>
                                                );
                                            });
                                        })()}

                                        <button
                                            className="pagination-btn"
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;