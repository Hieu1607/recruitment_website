import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaDownload, 
    FaArrowLeft, FaGlobe, FaBirthdayCake, 
    FaBriefcase, FaAward, FaCertificate, FaGithub, FaLinkedin
} from 'react-icons/fa';
import '../css/CVPreview.css';

const CVPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const componentRef = useRef();

    // 1. LẤY DỮ LIỆU
    const [cvData, setCvData] = useState(() => {
        if (location.state?.cvData) return location.state.cvData;
        try {
            const saved = localStorage.getItem('myCVData');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

    const [activeTemplate, setActiveTemplate] = useState('modern'); 
    const [themeColor, setThemeColor] = useState('#4e3b31');
    
    // --- [MỚI] STATE TÊN FILE ---
    const [fileName, setFileName] = useState(() => {
        const name = cvData?.personalInfo?.fullName || 'CV';
        // Tự động tạo tên file từ tên người dùng (VD: Nguyen_Huy_CV)
        return `CV_${name.replace(/\s+/g, '_')}`; 
    });

    const colorPalettes = {
        modern: ['#4e3b31', '#2c3e50', '#1d4ed8', '#047857', '#be123c', '#4338ca'],
        classic: ['#8b3a3a', '#5d4037', '#2c3e50', '#004d40', '#455a64', '#3e2723'],
        minimal: ['#000000', '#2c3e50', '#1565c0', '#2e7d32', '#c62828', '#424242'],
        impressive: ['#f0a500', '#00e5ff', '#76ff03', '#ff4081', '#ffd740', '#e0e0e0']
    };

    useEffect(() => {
        if (colorPalettes[activeTemplate]) {
            setThemeColor(colorPalettes[activeTemplate][0]);
        }
    }, [activeTemplate]);

    useEffect(() => {
        if (!cvData) {
            alert("Không tìm thấy dữ liệu CV! Vui lòng quay lại trang nhập liệu.");
            navigate('/');
        }
    }, [cvData, navigate]);

    // --- HÀM XỬ LÝ IN ẤN (Smart Print) ---
    const handlePrint = () => {
        const originalTitle = document.title;
        
        // 1. Xử lý tên file: Xóa đuôi .pdf nếu người dùng lỡ nhập vào
        let nameToSave = fileName.trim();
        if (nameToSave.toLowerCase().endsWith('.pdf')) {
            nameToSave = nameToSave.slice(0, -4);
        }

        // 2. Đặt tiêu đề trang = Tên file (Trình duyệt sẽ dùng tên này làm tên file PDF)
        document.title = nameToSave;

        // 3. In
        window.print();

        // 4. Trả lại tiêu đề cũ
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };

    if (!cvData) return null;

    // --- HELPER FUNCTIONS ---
    const RenderRichText = ({ html }) => html ? <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: html }} /> : null;
    const formatDate = (m, y) => (m && y ? `${m}/${y}` : y ? `${y}` : '');
    const formatTime = (item) => {
        const start = formatDate(item.startMonth, item.startYear);
        const end = item.isCurrent ? 'Hiện tại' : formatDate(item.endMonth, item.endYear);
        return start || end ? `${start} - ${end}` : '';
    };

    /* ================= 1. MẪU HIỆN ĐẠI ================= */
    const renderModern = () => (
        <div className="modern-layout">
            <div className="modern-sidebar" style={{ backgroundColor: themeColor }}>
                <div className="modern-avatar-container">
                    {cvData.personalInfo.avatar ? (
                        <img src={cvData.personalInfo.avatar} alt="Avatar" className="modern-avatar" />
                    ) : (
                        <div className="modern-avatar-placeholder">{cvData.personalInfo.fullName.charAt(0)}</div>
                    )}
                </div>
                <div className="modern-profile-info">
                    <h1 className="modern-name">{cvData.personalInfo.fullName}</h1>
                    <h2 className="modern-job-title">{cvData.personalInfo.title}</h2>
                </div>
                <div className="modern-contact-list">
                    <div className="m-contact-item"><FaPhoneAlt className="m-icon"/> <span>{cvData.personalInfo.phone}</span></div>
                    {cvData.personalInfo.dob && <div className="m-contact-item"><FaBirthdayCake className="m-icon"/> <span>{cvData.personalInfo.dob}</span></div>}
                    <div className="m-contact-item"><FaEnvelope className="m-icon"/> <span>{cvData.personalInfo.email}</span></div>
                    {cvData.personalInfo.city && <div className="m-contact-item"><FaMapMarkerAlt className="m-icon"/> <span>{cvData.personalInfo.city}</span></div>}
                    {cvData.personalInfo.website && <div className="m-contact-item"><FaGlobe className="m-icon"/> <span>{cvData.personalInfo.website}</span></div>}
                </div>

                {cvData.educations.length > 0 && (
                    <div className="modern-sidebar-section">
                        <div className="modern-pill-header" style={{color: themeColor}}>Học vấn</div>
                        {cvData.educations.map((e, i) => (
                            <div key={i} className="m-sidebar-item">
                                <div className="m-degree">{e.degree}</div>
                                <div className="m-time-range">{formatTime(e)}</div>
                                <div className="m-school">{e.school}</div>
                            </div>
                        ))}
                    </div>
                )}
                {(cvData.skills.hardSkills || cvData.skills.softSkills) && (
                    <div className="modern-sidebar-section">
                        <div className="modern-pill-header" style={{color: themeColor}}>Kỹ năng</div>
                        <div className="m-skills-list">
                            {cvData.skills.hardSkills && cvData.skills.hardSkills.split(',').map((s,i) => <div key={i} className="m-skill-line">• {s.trim()}</div>)}
                            {cvData.skills.softSkills && cvData.skills.softSkills.split(',').map((s,i) => <div key={`s-${i}`} className="m-skill-line">• {s.trim()}</div>)}
                        </div>
                    </div>
                )}
            </div>

            <div className="modern-main">
                {cvData.introduction && (
                    <div className="modern-main-section">
                        <div className="modern-main-header">
                            <span className="modern-header-pill" style={{backgroundColor: themeColor}}>Mục tiêu nghề nghiệp</span>
                            <div className="modern-header-line" style={{borderColor: themeColor}}></div>
                        </div>
                        <div className="modern-section-content"><RenderRichText html={cvData.introduction} /></div>
                    </div>
                )}
                {cvData.experiences.length > 0 && (
                    <div className="modern-main-section">
                        <div className="modern-main-header">
                            <span className="modern-header-pill" style={{backgroundColor: themeColor}}>Kinh nghiệm làm việc</span>
                            <div className="modern-header-line" style={{borderColor: themeColor}}></div>
                        </div>
                        <div className="modern-section-content">
                            {cvData.experiences.map((e, i) => (
                                <div key={i} className="modern-exp-item">
                                    <div className="m-exp-row">
                                        <div className="m-exp-title">{e.title}</div>
                                        <div className="m-exp-date">{formatTime(e)}</div>
                                    </div>
                                    <div className="m-exp-company">{e.company}</div>
                                    <RenderRichText html={e.description}/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {cvData.projects.length > 0 && (
                    <div className="modern-main-section">
                        <div className="modern-main-header">
                            <span className="modern-header-pill" style={{backgroundColor: themeColor}}>Dự án nổi bật</span>
                            <div className="modern-header-line" style={{borderColor: themeColor}}></div>
                        </div>
                        <div className="modern-section-content">
                            {cvData.projects.map((p, i) => (
                                <div key={i} className="modern-exp-item">
                                    <div className="m-exp-row">
                                        <div className="m-exp-title">{p.name}</div>
                                        <div className="m-exp-date">{formatTime(p)}</div>
                                    </div>
                                    <RenderRichText html={p.description}/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {cvData.awards.length > 0 && (
                     <div className="modern-main-section">
                        <div className="modern-main-header">
                            <span className="modern-header-pill" style={{backgroundColor: themeColor}}>Giải thưởng</span>
                            <div className="modern-header-line" style={{borderColor: themeColor}}></div>
                        </div>
                        <div className="modern-section-content">
                             {cvData.awards.map((a, i) => (
                                <div key={i} className="m-award-row">
                                    <span className="m-award-year">●</span>
                                    <span className="m-award-name"><strong>{a.name}</strong> - {a.organization}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    /* ================= 2. MẪU CỔ ĐIỂN ================= */
    const renderClassic = () => (
        <div className="classic-layout">
            <div className="classic-sidebar">
                <div className="classic-avatar-box">
                    {cvData.personalInfo.avatar ? (
                        <img src={cvData.personalInfo.avatar} alt="Avatar" className="classic-avatar" style={{borderColor: themeColor}} />
                    ) : (
                        <div className="classic-avatar-placeholder" style={{backgroundColor: themeColor}}>{cvData.personalInfo.fullName.charAt(0)}</div>
                    )}
                </div>
                <div className="classic-contact-list">
                    <div className="c-contact-row">
                        <div className="c-icon-circle" style={{color: themeColor, borderColor: themeColor}}><FaPhoneAlt /></div><span>{cvData.personalInfo.phone}</span>
                    </div>
                    <div className="c-contact-row">
                        <div className="c-icon-circle" style={{color: themeColor, borderColor: themeColor}}><FaEnvelope /></div><span>{cvData.personalInfo.email}</span>
                    </div>
                    {cvData.personalInfo.city && <div className="c-contact-row"><div className="c-icon-circle" style={{color: themeColor, borderColor: themeColor}}><FaMapMarkerAlt /></div><span>{cvData.personalInfo.city}</span></div>}
                </div>

                {cvData.educations.length > 0 && (
                    <div className="classic-sidebar-section">
                        <div className="classic-sidebar-header" style={{backgroundColor: themeColor, color: '#fff'}}>Học vấn</div>
                        {cvData.educations.map((e, i) => (
                            <div key={i} className="c-sidebar-item">
                                <div className="c-school">{e.school}</div>
                                <div className="c-time">{formatTime(e)}</div>
                                <div className="c-degree">{e.degree}</div>
                            </div>
                        ))}
                    </div>
                )}
                 {(cvData.skills.hardSkills || cvData.skills.softSkills) && (
                    <div className="classic-sidebar-section">
                        <div className="classic-sidebar-header" style={{backgroundColor: themeColor, color: '#fff'}}>Kỹ năng</div>
                        <div className="c-skills-content">
                            {cvData.skills.hardSkills && cvData.skills.hardSkills.split(',').map((s,i) => <div key={i} className="c-skill-line">• {s.trim()}</div>)}
                            {cvData.skills.softSkills && cvData.skills.softSkills.split(',').map((s,i) => <div key={`s-${i}`} className="c-skill-line">• {s.trim()}</div>)}
                        </div>
                    </div>
                )}
            </div>

            <div className="classic-main">
                <div className="classic-main-header" style={{borderBottomColor: '#f0f0f0'}}>
                    <h1 className="classic-name" style={{color: themeColor}}>{cvData.personalInfo.fullName}</h1>
                    <h2 className="classic-title" style={{color: themeColor, opacity: 0.8}}>{cvData.personalInfo.title}</h2>
                </div>
                {cvData.introduction && (
                    <div className="classic-main-section">
                        <h3 className="classic-section-title" style={{color: themeColor}}>Mục tiêu nghề nghiệp</h3>
                        <div className="classic-text-content"><RenderRichText html={cvData.introduction} /></div>
                    </div>
                )}
                {cvData.experiences.length > 0 && (
                    <div className="classic-main-section">
                        <h3 className="classic-section-title" style={{color: themeColor}}>Kinh nghiệm làm việc</h3>
                        {cvData.experiences.map((e, i) => (
                            <div key={i} className="classic-exp-item">
                                <div className="c-exp-header">
                                    <span className="c-exp-company">{e.company}</span>
                                    <span className="c-exp-date">({formatTime(e)})</span>
                                </div>
                                <div className="c-exp-title" style={{color: themeColor}}>{e.title}</div>
                                <div className="c-exp-desc"><RenderRichText html={e.description} /></div>
                            </div>
                        ))}
                    </div>
                )}
                 {cvData.projects.length > 0 && (
                    <div className="classic-main-section">
                        <h3 className="classic-section-title" style={{color: themeColor}}>Dự án tham gia</h3>
                        {cvData.projects.map((p, i) => (
                            <div key={i} className="classic-exp-item">
                                <div className="c-exp-header">
                                    <span className="c-exp-company">{p.name}</span>
                                    <span className="c-exp-date">({formatTime(p)})</span>
                                </div>
                                <div className="c-exp-desc"><RenderRichText html={p.description} /></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    /* ================= 3. MẪU TỐI GIẢN ================= */
    const renderMinimal = () => (
        <div className="minimal-layout">
            <header className="minimal-header" style={{borderBottomColor: themeColor}}>
                <div className="min-header-left">
                    <h1 className="min-name" style={{color: themeColor}}>{cvData.personalInfo.fullName}</h1>
                    <h2 className="min-title">{cvData.personalInfo.title}</h2>
                </div>
                <div className="min-header-right">
                    <div className="min-contact-item"><FaPhoneAlt className="min-icon"/> <span>{cvData.personalInfo.phone}</span></div>
                    <div className="min-contact-item"><FaEnvelope className="min-icon"/> <span>{cvData.personalInfo.email}</span></div>
                    {cvData.personalInfo.city && <div className="min-contact-item"><FaMapMarkerAlt className="min-icon"/> <span>{cvData.personalInfo.city}</span></div>}
                </div>
            </header>

            {cvData.introduction && (
                <section className="minimal-section">
                    <div className="min-section-title" style={{color: themeColor}}>Mục tiêu nghề nghiệp</div>
                    <div className="min-intro-content"><RenderRichText html={cvData.introduction} /></div>
                </section>
            )}

            {cvData.experiences.length > 0 && (
                <section className="minimal-section">
                    <div className="min-section-title" style={{color: themeColor}}>Kinh nghiệm làm việc</div>
                    <div className="min-timeline-container">
                        {cvData.experiences.map((e, i) => (
                            <div key={i} className="min-timeline-item">
                                <div className="min-tl-left">
                                    <div className="min-company">{e.company}</div>
                                    <div className="min-date">{formatTime(e)}</div>
                                </div>
                                <div className="min-tl-divider">
                                    <div className="min-tl-dot" style={{background: themeColor}}></div>
                                    <div className="min-tl-line"></div>
                                </div>
                                <div className="min-tl-right">
                                    <div className="min-job-title">{e.title}</div>
                                    <div className="min-desc"><RenderRichText html={e.description}/></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="min-bottom-grid">
                {cvData.educations.length > 0 && (
                     <div className="min-col">
                        <div className="min-section-title" style={{color: themeColor}}>Học vấn</div>
                        {cvData.educations.map((e, i) => (
                            <div key={i} className="min-edu-item">
                                <div className="min-time-sm">{formatTime(e)}</div>
                                <div className="min-school">{e.school}</div>
                                <div className="min-degree">{e.degree}</div>
                            </div>
                        ))}
                    </div>
                )}
                {(cvData.skills.hardSkills || cvData.skills.softSkills) && (
                    <div className="min-col">
                        <div className="min-section-title" style={{color: themeColor}}>Kỹ năng</div>
                        <div className="min-skills-box">
                            {cvData.skills.hardSkills && <div className="min-skill-row"><strong>Chuyên môn:</strong> {cvData.skills.hardSkills}</div>}
                            {cvData.skills.softSkills && <div className="min-skill-row"><strong>Kỹ năng khác:</strong> {cvData.skills.softSkills}</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    /* ================= 4. MẪU ẤN TƯỢNG ================= */
    const renderImpressive = () => (
        <div className="impressive-layout">
            <div className="vintage-main">
                {cvData.introduction && (
                    <div className="vin-section">
                        <div className="vin-header" style={{borderBottomColor: themeColor}}>
                            <div className="vin-icon-box" style={{backgroundColor: themeColor}}><FaGlobe /></div>
                            <h3 className="vin-title" style={{color: themeColor}}>Mục tiêu nghề nghiệp</h3>
                        </div>
                        <div className="vin-content"><RenderRichText html={cvData.introduction} /></div>
                    </div>
                )}
                {cvData.experiences.length > 0 && (
                    <div className="vin-section">
                         <div className="vin-header" style={{borderBottomColor: themeColor}}>
                            <div className="vin-icon-box" style={{backgroundColor: themeColor}}><FaBriefcase /></div>
                            <h3 className="vin-title" style={{color: themeColor}}>Kinh nghiệm làm việc</h3>
                        </div>
                        {cvData.experiences.map((e, i) => (
                            <div key={i} className="vin-item">
                                <div className="vin-item-top">
                                    <strong className="vin-company">{e.company}</strong>
                                    <span className="vin-date">{formatTime(e)}</span>
                                </div>
                                <div className="vin-job-title">{e.title}</div>
                                <div className="vin-desc"><RenderRichText html={e.description} /></div>
                            </div>
                        ))}
                    </div>
                )}
                 {cvData.projects.length > 0 && (
                    <div className="vin-section">
                         <div className="vin-header" style={{borderBottomColor: themeColor}}>
                            <div className="vin-icon-box" style={{backgroundColor: themeColor}}><FaGithub /></div>
                            <h3 className="vin-title" style={{color: themeColor}}>Dự án thực tế</h3>
                        </div>
                        {cvData.projects.map((p, i) => (
                            <div key={i} className="vin-item">
                                <div className="vin-item-top">
                                    <strong className="vin-company">{p.name}</strong>
                                    <span className="vin-date">{formatTime(p)}</span>
                                </div>
                                <div className="vin-desc"><RenderRichText html={p.description} /></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="vintage-sidebar">
                <div className="vin-profile-header">
                    <h1 className="vin-name">{cvData.personalInfo.fullName}</h1>
                    <h2 className="vin-job">{cvData.personalInfo.title}</h2>
                </div>
                <div className="vin-avatar-box">
                    {cvData.personalInfo.avatar ? (
                        <img src={cvData.personalInfo.avatar} alt="Avatar" className="vin-avatar" />
                    ) : (
                        <div className="vin-avatar-placeholder">{cvData.personalInfo.fullName.charAt(0)}</div>
                    )}
                </div>
                <div className="vin-contact-list">
                    <div className="vin-contact-row"><FaPhoneAlt className="vin-icon" style={{color: themeColor}}/> <span>{cvData.personalInfo.phone}</span></div>
                    <div className="vin-contact-row"><FaEnvelope className="vin-icon" style={{color: themeColor}}/> <span>{cvData.personalInfo.email}</span></div>
                    {cvData.personalInfo.city && <div className="vin-contact-row"><FaMapMarkerAlt className="vin-icon" style={{color: themeColor}}/> <span>{cvData.personalInfo.city}</span></div>}
                </div>

                {(cvData.skills.hardSkills || cvData.skills.softSkills) && (
                    <div className="vin-sidebar-section">
                        <div className="vin-sidebar-title">Kỹ năng</div>
                        <div className="vin-skill-list">
                             {cvData.skills.hardSkills && cvData.skills.hardSkills.split(',').map((s, i) => (
                                <div key={i} className="vin-skill-item">
                                    <div className="vin-skill-name">{s.trim()}</div>
                                    <div className="vin-progress-bar"><div className="vin-progress-fill" style={{width: `${Math.random() * 30 + 70}%`, backgroundColor: themeColor}}></div></div>
                                </div>
                             ))}
                        </div>
                    </div>
                )}
                 {cvData.awards.length > 0 && (
                    <div className="vin-sidebar-section">
                         <div className="vin-sidebar-title" style={{color: themeColor}}>
                             <FaAward style={{marginRight:5}}/> Danh hiệu & Giải thưởng
                         </div>
                         {cvData.awards.map((a, i) => (
                             <div key={i} className="vin-side-text">
                                 <strong style={{color: themeColor}}>{a.year || '20XX'}</strong><br/>
                                 {a.name}
                             </div>
                         ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="cv-preview-page"> 
            <div className="preview-layout">
                {/* SIDEBAR CHỌN MẪU */}
                <div className="template-sidebar no-print">
                    <button className="btn-back" onClick={() => navigate('/')}><FaArrowLeft /> Quay lại chỉnh sửa</button>
                    <h3>Chọn mẫu CV</h3>
                    <div className="template-list">
                        <div className={`t-card ${activeTemplate === 'modern' ? 'active' : ''}`} onClick={() => setActiveTemplate('modern')}>
                            <div className="t-img modern-preview">Hiện đại</div><span>Chuyên nghiệp</span>
                        </div>
                        <div className={`t-card ${activeTemplate === 'classic' ? 'active' : ''}`} onClick={() => setActiveTemplate('classic')}>
                            <div className="t-img classic-preview">Cổ điển</div><span>Thanh lịch</span>
                        </div>
                        <div className={`t-card ${activeTemplate === 'minimal' ? 'active' : ''}`} onClick={() => setActiveTemplate('minimal')}>
                            <div className="t-img minimal-preview">Tối giản</div><span>Sạch sẽ</span>
                        </div>
                        <div className={`t-card ${activeTemplate === 'impressive' ? 'active' : ''}`} onClick={() => setActiveTemplate('impressive')}>
                            <div className="t-img vintage-preview">Ấn tượng</div><span>Tương phản cao</span>
                        </div>
                    </div>
                </div>

                {/* KHU VỰC HIỂN THỊ */}
                <div className="preview-main-area">
                    <div className="cv-paper-container">
                        <div className={`cv-paper ${activeTemplate}`} ref={componentRef}>
                            {activeTemplate === 'modern' && renderModern()}
                            {activeTemplate === 'classic' && renderClassic()}
                            {activeTemplate === 'minimal' && renderMinimal()}
                            {activeTemplate === 'impressive' && renderImpressive()}
                        </div>
                    </div>

                    {/* BOTTOM BAR: IN ẤN & TÊN FILE */}
                    <div className="bottom-bar no-print">
                        <div className="bar-colors">
                            <span>Màu chủ đạo:</span>
                            {colorPalettes[activeTemplate].map(c => (
                                <button 
                                    key={c} 
                                    className={`dot ${themeColor === c ? 'active' : ''}`} 
                                    style={{background: c}} 
                                    onClick={() => setThemeColor(c)} 
                                    title={c}
                                />
                            ))}
                        </div>
                        
                        <div style={{flex:1}}></div>

                        {/* Ô NHẬP TÊN FILE */}
                        <div className="filename-input-group" style={{display: 'flex', alignItems: 'center', gap: 10, marginRight: 20}}>
                            <label style={{fontSize: 13, fontWeight: 600}}>Tên file:</label>
                            <input 
                                type="text" 
                                value={fileName} 
                                onChange={(e) => setFileName(e.target.value)} 
                                style={{
                                    padding: '8px 12px', 
                                    borderRadius: 4, 
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    fontSize: 14,
                                    width: 200
                                }}
                            />
                            <span style={{fontSize: 13, color: '#666', fontWeight: 500}}>.pdf</span>
                        </div>

                        <button className="btn-download" onClick={handlePrint}><FaDownload /> Tải xuống PDF</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVPreview;