import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header.jsx';
import jobService from '../services/jobService';
import CompanyName from '../components/CompanyName';
import JobFilter from '../components/JobFilter';
import '../css/home.css';

const paginationStyle = {
  container: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px', paddingBottom: '20px' },
  btn: { border: '1px solid #e2e8f0', background: 'white', color: '#64748b', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' },
  activeBtn: { background: '#00b14f', color: 'white', borderColor: '#00b14f' },
  disabledBtn: { background: '#f1f5f9', color: '#cbd5e1', cursor: 'not-allowed', opacity: 0.7 }
};

const Home = () => {
  const { user, logout } = useAuth();
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
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- State Phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Giới hạn 10 việc mỗi trang

  // 1. Tải gợi ý ban đầu
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await jobService.getSuggestions();
        setPopularKeywords(data.keywords || []);
        setSuggestedJobs(data.jobs || []);
      } catch (error) { 
        console.error(error); 
      }
    };
    fetchSuggestions();
  }, []);

  // 2. Hàm xử lý tìm kiếm
  const executeSearch = async (searchKeyword, searchLocation) => {
    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1); // Reset về trang 1 khi tìm mới
    
    try {
      // Gọi API lấy TẤT CẢ việc làm (Backend trả về bao nhiêu thì lấy bấy nhiêu)
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
    setCurrentPage(1); // Reset về trang 1 khi lọc lại
  };

  // 3. Logic lọc dữ liệu
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

  // 4. LOGIC PHÂN TRANG (Cắt danh sách filteredJobs thành từng trang)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Danh sách công việc hiển thị TRÊN TRANG HIỆN TẠI (chỉ 10 cái)
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  
  // Tổng số trang
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper rút gọn địa điểm
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
                                        <h4 style={{ fontSize: '15px', color: '#2563eb' }}>{job.title}</h4>
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
                
                {/* Chưa tìm kiếm */}
                {!hasSearched && (
                    <div className="status-card">
                        <h3>Nhập từ khóa hoặc chọn bộ lọc để tìm việc làm phù hợp</h3>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="loading-text">Đang tìm kiếm...</div>
                )}

                {/* Kết quả tìm kiếm */}
                {hasSearched && !loading && (
                    <>
                        <h2 className="section-title">
                             Việc làm phù hợp
                        </h2>

                        <div className="job-grid">
                            {/* Lặp qua currentJobs (đã cắt 10 cái) thay vì toàn bộ filteredJobs */}
                            {currentJobs.length > 0 ? currentJobs.map((job, index) => (
                                <div key={job.id || index} className="job-card">
                                    <div>
                                        <h3 className="job-card-title">
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

                        {/* THANH PHÂN TRANG (Hiển thị khi có kết quả > 0) */}
                        {filteredJobs.length > 0 && (
                            <div className="pagination-container">
                                <button 
                                    className="pagination-btn"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Trước
                                </button>
                                
                                {/* Tạo các nút số trang */}
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => paginate(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

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