import React, { useState, useEffect } from 'react';
import { getAllCandidates } from '../../services/candidateService';
import '../../css/CandidateList.css';

const CandidateSearch = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // [MỚI] State cho Modal
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        const data = await getAllCandidates();
        setCandidates(data);
        setLoading(false);
    };

    const filteredCandidates = candidates.filter(c => {
        const name = c.name || c.full_name || '';
        const email = c.email || '';
        const term = searchTerm.toLowerCase();
        return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
    });

    // [MỚI] Hàm mở/đóng Modal
    const handleViewProfile = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const closeModal = () => {
        setSelectedCandidate(null);
    };

    return (
        <div className="candidate-page">
            <div className="candidate-container">
                <div className="page-header">
                    <div>
                        <h1>Tìm kiếm ứng viên</h1>
                        <p>Tìm thấy {filteredCandidates.length} ứng viên tiềm năng</p>
                    </div>
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Nhập tên hoặc email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign: 'center', marginTop: '50px'}}>Đang tải dữ liệu...</div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="empty-state">Không tìm thấy ứng viên nào.</div>
                ) : (
                    <div className="candidate-grid">
                        {filteredCandidates.map((candidate) => (
                            <div key={candidate.id} className="candidate-card">
                                <div className="card-header">
                                    <div className="candidate-info">
                                        <img 
                                            src={candidate.avatar_url || `https://ui-avatars.com/api/?name=${candidate.name}&background=random`} 
                                            alt="Avatar" 
                                            className="candidate-avatar"
                                            onError={(e) => {e.target.onerror=null; e.target.src="https://via.placeholder.com/100"}}
                                        />
                                        <div>
                                            <h3 className="candidate-name">
                                                {candidate.full_name || candidate.name || "Chưa cập nhật tên"}
                                            </h3>
                                            <p className="candidate-email">{candidate.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="info-row">
                                        <strong>SĐT:</strong>
                                        <span>{candidate.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="info-row">
                                        <strong>Địa chỉ:</strong>
                                        <span>{candidate.address || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    {/* [MỚI] Gắn sự kiện onClick mở Modal */}
                                    <button 
                                        className="btn-view-cv"
                                        onClick={() => handleViewProfile(candidate)}
                                    >
                                        👁️ Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- [MỚI] PHẦN MODAL POPUP --- */}
            {selectedCandidate && (
                <div className="modal-overlay" onClick={closeModal}>
                    {/* stopPropagation để click vào nội dung không bị đóng modal */}
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Nút tắt X */}
                        <button className="modal-close-btn" onClick={closeModal}>&times;</button>

                        {/* Header Modal */}
                        <div className="modal-header-profile">
                            <img 
                                src={selectedCandidate.avatar_url || `https://ui-avatars.com/api/?name=${selectedCandidate.name}&background=random`} 
                                alt="Avatar" 
                                className="modal-avatar-large"
                                onError={(e) => {e.target.onerror=null; e.target.src="https://via.placeholder.com/150"}}
                            />
                            <h2 className="modal-name">
                                {selectedCandidate.full_name || selectedCandidate.name || "Ứng viên"}
                            </h2>
                            <p className="modal-role">Ứng viên tiềm năng</p>
                        </div>

                        {/* Body Modal - Thông tin chi tiết */}
                        <div className="modal-body">
                            <div className="modal-info-group">
                                <span className="modal-label">Thông tin liên hệ</span>
                                <div className="modal-value">📧 {selectedCandidate.email}</div>
                                <div className="modal-value">📞 {selectedCandidate.phone || "Chưa cập nhật SĐT"}</div>
                            </div>

                            <div className="modal-info-group">
                                <span className="modal-label">Địa chỉ</span>
                                <div className="modal-value">📍 {selectedCandidate.address || "Chưa cập nhật địa chỉ"}</div>
                            </div>

                            <div className="modal-info-group">
                                <span className="modal-label">Ngày tham gia hệ thống</span>
                                <div className="modal-value">
                                    📅 {selectedCandidate.created_at 
                                        ? new Date(selectedCandidate.created_at).toLocaleDateString('vi-VN') 
                                        : 'N/A'}
                                </div>
                            </div>

                            {/* Nếu có CV Link (tùy backend của bạn có trả về không) */}
                            {selectedCandidate.cv_url && (
                                <div className="modal-info-group">
                                    <span className="modal-label">Hồ sơ đính kèm</span>
                                    <a href={selectedCandidate.cv_url} target="_blank" rel="noreferrer" style={{color: '#00b14f', fontWeight: 'bold'}}>
                                        📄 Tải xuống CV
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Footer Modal - Nút hành động */}
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeModal}>Đóng</button>
                            <button 
                                className="btn-accept" 
                                onClick={() => alert(`Đã gửi email mời phỏng vấn tới: ${selectedCandidate.email}`)}
                            >
                                📩 Mời phỏng vấn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateSearch;