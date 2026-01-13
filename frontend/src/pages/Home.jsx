import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import CompanyName from '../components/CompanyName';
import JobFilter from '../components/JobFilter';
import '../css/home.css';
import '../css/Pagination.css';

// --- DANH SÁCH 63 TỈNH THÀNH ---
const VIETNAM_PROVINCES = [
    "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
    "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
    "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
    "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
    "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
    "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
    "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
    "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const Home = () => {
    const navigate = useNavigate();

    // --- State tìm kiếm ---
    const [keyword, setKeyword] = useState('');
    
    // State cho địa điểm: Mặc định rỗng để hiện placeholder
    const [location, setLocation] = useState(''); 
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

    // State hiển thị gợi ý từ khóa
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
    
    const [hasSearched, setHasSearched] = useState(true); 
    const [loading, setLoading] = useState(true); 

    // --- State Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [suggestionData, allJobsData] = await Promise.all([
                    jobService.getSuggestions(),
                    jobService.getJobs('', 'all')
                ]);

                setPopularKeywords(suggestionData.keywords || []);
                setSuggestedJobs(suggestionData.jobs || []);
                setJobResults(allJobsData || []);
                
            } catch (error) {
                console.error("Lỗi tải dữ liệu ban đầu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const executeSearch = async (searchKeyword, searchLocation) => {
        setLoading(true);
        setHasSearched(true);
        setCurrentPage(1);

        try {
            // Logic: Nếu location rỗng hoặc "Tất cả..." -> gửi 'all' lên server
            const locToSend = (!searchLocation || searchLocation === 'Tất cả địa điểm') ? 'all' : searchLocation;
            
            const results = await jobService.getJobs(searchKeyword, locToSend);
            setJobResults(results || []);
        } catch (error) {
            setJobResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchBtn = () => {
        setShowSuggestions(false);
        setShowLocationSuggestions(false);
        executeSearch(keyword, location);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchBtn();
        }
    };

    // --- LOGIC GỢI Ý ĐỊA ĐIỂM ---
    const locationSuggestions = useMemo(() => {
        // Nếu chưa nhập gì, gợi ý 5 thành phố lớn
        if (!location) return ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Bình Dương", "Cần Thơ"];
        
        // Nếu đã nhập, lọc danh sách và lấy 5 kết quả
        return VIETNAM_PROVINCES.filter(prov => 
            prov.toLowerCase().includes(location.toLowerCase())
        ).slice(0, 5);
    }, [location]);

    const handleSelectLocation = (prov) => {
        setLocation(prov);
        setShowLocationSuggestions(false);
    };

    // --- Xử lý gợi ý từ khóa ---
    const handleSelectKeyword = (kw) => {
        setKeyword(kw);
        setShowSuggestions(false);
        executeSearch(kw, location);
    };

    const handleFilterChange = (newFilters) => {
        setAdvancedFilters(newFilters);
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

            // --- LỌC ĐỊA ĐIỂM ---
            if (location && location !== 'all' && location !== 'Tất cả địa điểm') {
                const locLower = (job.location || '').toLowerCase();
                const filterLower = location.toLowerCase();
                
                // So sánh chuỗi (Flexible search)
                if (!locLower.includes(filterLower)) {
                    isMatch = false;
                }
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
            <div className="hero-section">
                <h1 className="hero-title">
                    <span style={{ color: '#60a5fa' }}>JobCV</span> - Tìm việc làm nhanh chóng
                </h1>

                <div className="search-container">
                    {/* 1. Ô NHẬP TỪ KHÓA (Chiếm nhiều không gian hơn: flex 1) */}
                    <div className="search-input-group" style={{ flex: 1 }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text" className="search-input"
                            placeholder="Vị trí tuyển dụng, tên công ty..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                    </div>
                    
                    {/* 2. Ô NHẬP ĐỊA ĐIỂM (Bé hơn: flex 0.35 và minWidth) */}
                    <div 
                        className="search-input-group" 
                        style={{ flex: 0.35, position: 'relative', minWidth: '200px' }}
                    >
                        <span className="search-icon">📍</span>
                        <input 
                            type="text" 
                            className="search-input"
                            placeholder="Tỉnh/Thành phố"
                            value={location === 'all' ? '' : location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                setShowLocationSuggestions(true);
                            }}
                            onFocus={() => setShowLocationSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearchBtn();
                            }}
                        />
                        
                        {/* DANH SÁCH GỢI Ý ĐỊA ĐIỂM (Dropdown) */}
                        {showLocationSuggestions && locationSuggestions.length > 0 && (
                            <ul className="location-suggestions-list">
                                {locationSuggestions.map((prov, idx) => (
                                    <li key={idx} onClick={() => handleSelectLocation(prov)}>
                                        {prov}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button className="search-btn" onClick={handleSearchBtn}>Tìm kiếm</button>

                    {/* GỢI Ý TỪ KHÓA (CŨ) */}
                    {showSuggestions && (
                        <div className="search-suggestions">
                            <div className="suggestion-body">
                                <div className="suggestion-col-left">
                                    <div className="suggestion-title">Từ khóa phổ biến</div>
                                    <ul className="keyword-list">
                                        {popularKeywords.map((kw, i) => (
                                            <li key={i} className="keyword-item" onClick={() => handleSelectKeyword(kw)}>
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

            <div className="main-content">
                <div className="content-layout">
                    <div className="sidebar-wrapper">
                        <JobFilter onFilterChange={handleFilterChange} />
                    </div>

                    <div className="job-list-wrapper">
                        {loading && (
                            <div className="loading-text">Đang tải danh sách việc làm...</div>
                        )}

                        {!loading && (
                            <>
                                <h2 className="section-title">
                                    {keyword ? `Kết quả tìm kiếm cho "${keyword}"` : 'Tất cả việc làm'}
                                </h2>

                                <div className="job-grid">
                                    {currentJobs.length > 0 ? currentJobs.map((job, index) => (
                                        <div key={job.id || index} className="job-card">
                                            <div>
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
                                            <p>Không tìm thấy kết quả nào phù hợp.</p>
                                        </div>
                                    )}
                                </div>

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
                                                    return <span key={`ellipsis-${index}`} className="pagination-ellipsis" style={{ padding: '0 10px' }}>...</span>;
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