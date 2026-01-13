import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CVBuilder.css'; 

// --- COMPONENT: RICH TEXT EDITOR (GIỮ NGUYÊN) ---
const RichTextEditor = ({ value, onChange, placeholder }) => {
    const editorRef = useRef(null);

    const handleFormat = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
    };

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            if (document.activeElement !== editorRef.current || !value) {
                 editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const handleInput = (e) => {
        onChange(e.currentTarget.innerHTML);
    };

    return (
        <div className="rich-editor-container">
            <div className="rich-text-toolbar">
                <button type="button" className="tool-btn" title="In đậm" onClick={() => handleFormat('bold')}><b>B</b></button>
                <button type="button" className="tool-btn" title="In nghiêng" onClick={() => handleFormat('italic')}><i>I</i></button>
                <button type="button" className="tool-btn" title="Gạch chân" onClick={() => handleFormat('underline')}><u>U</u></button>
                <button type="button" className="tool-btn" title="Danh sách" onClick={() => handleFormat('insertUnorderedList')}>• List</button>
            </div>
            <div
                className="rich-content"
                contentEditable
                ref={editorRef}
                onInput={handleInput}
                suppressContentEditableWarning
                data-placeholder={placeholder}
            />
        </div>
    );
};

// --- DATA CONSTANTS ---
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

const CVBuilder = () => {
    const navigate = useNavigate();

    // --- 1. STATE KHỞI TẠO ---
    const defaultData = {
        personalInfo: {
            fullName: 'Nguyen Huy',
            title: 'Fullstack Developer',
            email: 'huynguyenqang@gmail.com',
            phone: '0862413829',
            dob: '2004-11-28',
            gender: 'Nam',
            city: 'Hà Nội',
            address: '',
            website: '',
            avatar: null
        },
        skills: { hardSkills: '', softSkills: '' },
        introduction: '',
        strengths: '',
        educations: [],
        experiences: [],
        projects: [],
        certificates: [],
        awards: []
    };

    // Khởi tạo state: Thử lấy từ localStorage trước, nếu không có thì dùng defaultData
    const [cvData, setCvData] = useState(() => {
        try {
            const savedData = localStorage.getItem('myCVData');
            return savedData ? JSON.parse(savedData) : defaultData;
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu cũ:", error);
            return defaultData;
        }
    });

    const [showModal, setShowModal] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [formData, setFormData] = useState({});
    const [editIndex, setEditIndex] = useState(null);

    // --- [MỚI] TỰ ĐỘNG LƯU VÀO LOCAL STORAGE KHI CVDATA THAY ĐỔI ---
    useEffect(() => {
        try {
            localStorage.setItem('myCVData', JSON.stringify(cvData));
        } catch (error) {
            // Lỗi này thường xảy ra khi ảnh quá lớn vượt quá quota 5MB của localStorage
            if (error.name === 'QuotaExceededError') {
                alert("Dữ liệu quá lớn (do ảnh) nên không thể lưu tự động. Vui lòng chọn ảnh nhỏ hơn (<2MB).");
            }
        }
    }, [cvData]);

    // --- 2. LOGIC TÍNH % ---
    const completionPercent = useMemo(() => {
        let count = 0;
        let total = 0;
        const check = (val) => (val && val.toString().trim().length > 0 ? 1 : 0);
        const checkArr = (arr) => (arr.length > 0 ? 1 : 0);

        total += 7; 
        const p = cvData.personalInfo;
        count += check(p.fullName) + check(p.title) + check(p.email) + check(p.phone) + check(p.city);
        
        total += 2; 
        count += check(cvData.skills.hardSkills) + check(cvData.skills.softSkills);

        total += 4; 
        count += checkArr(cvData.educations) + checkArr(cvData.experiences) + checkArr(cvData.projects) + check(cvData.introduction);

        return Math.min(100, Math.round((count / total) * 100));
    }, [cvData]);

    // --- 3. HANDLERS ---
    const handleOpenModal = (sectionKey, index = null) => {
        setActiveSection(sectionKey);
        setEditIndex(index);
        setShowModal(true);

        if (sectionKey === 'personalInfo') {
            setFormData({ ...cvData.personalInfo });
        } else if (sectionKey === 'skills') {
            setFormData({ ...cvData.skills });
        } else if (['introduction', 'strengths'].includes(sectionKey)) {
            setFormData({ content: cvData[sectionKey] });
        } else {
            if (index !== null) {
                setFormData({ ...cvData[sectionKey][index] });
            } else {
                setFormData({
                    isCurrent: false,
                    startMonth: '', startYear: '',
                    endMonth: '', endYear: '',
                    description: '',
                    name: '', school: '', company: '', title: '',
                    major: '', degree: '', organization: ''
                });
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // --- [SỬA LẠI] XỬ LÝ ẢNH & KIỂM TRA DUNG LƯỢNG ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra dung lượng (giới hạn 2MB để an toàn cho localStorage)
            if (file.size > 2 * 1024 * 1024) {
                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB để đảm bảo dữ liệu được lưu.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRichTextChange = (htmlContent) => {
        if (['introduction', 'strengths'].includes(activeSection)) {
            setFormData(prev => ({ ...prev, content: htmlContent }));
        } else {
            setFormData(prev => ({ ...prev, description: htmlContent }));
        }
    };

    const handleSave = () => {
        let newData = { ...cvData };

        if (activeSection === 'personalInfo') {
            newData.personalInfo = formData;
        } else if (activeSection === 'skills') {
            newData.skills = formData;
        } else if (['introduction', 'strengths'].includes(activeSection)) {
            newData[activeSection] = formData.content;
        } else {
            const list = [...newData[activeSection]];
            if (editIndex !== null) {
                list[editIndex] = formData;
            } else {
                list.push(formData);
            }
            newData[activeSection] = list;
        }

        setCvData(newData);
        setShowModal(false);
    };

    const handleDeleteItem = (sectionKey, index) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa mục này không?")) {
            const list = [...cvData[sectionKey]];
            list.splice(index, 1);
            setCvData(prev => ({ ...prev, [sectionKey]: list }));
        }
    };

    // --- [THÊM MỚI] Nút Reset dữ liệu (để xóa localStorage khi cần) ---
    const handleResetData = () => {
        if(window.confirm("Bạn có muốn xóa toàn bộ dữ liệu đã nhập và làm lại từ đầu không?")) {
            localStorage.removeItem('myCVData');
            window.location.reload();
        }
    }

    // --- 4. RENDER MODAL CONTENT ---
    const renderModalContent = () => {
        switch (activeSection) {
            case 'personalInfo':
                return (
                    <div className="form-layout-split">
                        <div className="form-row">
                            <div className="form-group" style={{width: '100%', textAlign: 'center'}}>
                                <div style={{width: 100, height: 100, borderRadius: '50%', background: '#eee', margin: '0 auto 10px', overflow: 'hidden', border: '1px solid #ddd'}}>
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    ) : (
                                        <div style={{lineHeight: '100px', color: '#ccc'}}>No Image</div>
                                    )}
                                </div>
                                <label className="btn-upload" style={{cursor: 'pointer', color: '#d32f2f', fontWeight: 'bold'}}>
                                    📸 Tải ảnh lên (Max 2MB)
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}} />
                                </label>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Họ và Tên <span className="red">*</span></label>
                                <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group half">
                                <label>Vị trí ứng tuyển <span className="red">*</span></label>
                                <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Email <span className="red">*</span></label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group half">
                                <label>Số điện thoại <span className="red">*</span></label>
                                <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Ngày sinh</label>
                                <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group half">
                                <label>Giới tính</label>
                                <select name="gender" value={formData.gender || ''} onChange={handleInputChange}>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Website / Portfolio</label>
                            <input type="text" name="website" value={formData.website || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                );

            case 'skills':
                return (
                    <div className="form-layout-stacked">
                        <div className="form-group">
                            <label>Kỹ năng chuyên môn (Hard Skills)</label>
                            <textarea className="input-textarea" name="hardSkills" placeholder="VD: Java, ReactJS..." value={formData.hardSkills || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Kỹ năng mềm (Soft Skills)</label>
                            <textarea className="input-textarea" name="softSkills" placeholder="VD: Giao tiếp, Tiếng Anh..." value={formData.softSkills || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                );

            case 'experiences':
                return (
                    <div className="form-layout-stacked">
                        <div className="form-group">
                            <label>Chức danh <span className="red">*</span></label>
                            <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="VD: Nhân viên kinh doanh" />
                        </div>
                        <div className="form-group">
                            <label>Tên công ty <span className="red">*</span></label>
                            <input type="text" name="company" value={formData.company || ''} onChange={handleInputChange} placeholder="VD: Công ty FPT" />
                        </div>
                        
                        <div className="form-check">
                            <input type="checkbox" id="exp-curr" name="isCurrent" checked={formData.isCurrent || false} onChange={handleInputChange} />
                            <label htmlFor="exp-curr">Tôi đang làm việc tại đây</label>
                        </div>

                        <div className="form-row date-row">
                            <div className="date-group">
                                <label>Từ <span className="red">*</span></label>
                                <div className="date-selects">
                                    <select name="startMonth" value={formData.startMonth || ''} onChange={handleInputChange}><option value="">Tháng</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    <select name="startYear" value={formData.startYear || ''} onChange={handleInputChange}><option value="">Năm</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                </div>
                            </div>
                            {!formData.isCurrent && (
                                <div className="date-group">
                                    <label>Đến <span className="red">*</span></label>
                                    <div className="date-selects">
                                        <select name="endMonth" value={formData.endMonth || ''} onChange={handleInputChange}><option value="">Tháng</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                        <select name="endYear" value={formData.endYear || ''} onChange={handleInputChange}><option value="">Năm</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Mô tả chi tiết</label>
                            <div className="tip-box">💡 <b>Tips:</b> Mô tả các nhiệm vụ chính và thành tích đạt được.</div>
                            <RichTextEditor value={formData.description} onChange={handleRichTextChange} placeholder="Mô tả công việc..." />
                        </div>
                    </div>
                );

            case 'projects':
                return (
                    <div className="form-layout-stacked">
                        <div className="form-group">
                            <label>Tên dự án <span className="red">*</span></label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Nhập tên dự án..." />
                        </div>
                        <div className="form-group">
                            <label>Khách hàng / Công ty (Nếu có)</label>
                            <input type="text" name="company" value={formData.company || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-check">
                            <input type="checkbox" id="pj-curr" name="isCurrent" checked={formData.isCurrent || false} onChange={handleInputChange} />
                            <label htmlFor="pj-curr">Tôi đang làm dự án này</label>
                        </div>
                        <div className="form-row date-row">
                            <div className="date-group">
                                <label>Bắt đầu <span className="red">*</span></label>
                                <div className="date-selects">
                                    <select name="startMonth" value={formData.startMonth || ''} onChange={handleInputChange}><option value="">Tháng</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    <select name="startYear" value={formData.startYear || ''} onChange={handleInputChange}><option value="">Năm</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                </div>
                            </div>
                            {!formData.isCurrent && (
                                <div className="date-group">
                                    <label>Kết thúc <span className="red">*</span></label>
                                    <div className="date-selects">
                                        <select name="endMonth" value={formData.endMonth || ''} onChange={handleInputChange}><option value="">Tháng</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                        <select name="endYear" value={formData.endYear || ''} onChange={handleInputChange}><option value="">Năm</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Mô tả dự án</label>
                            <div className="tip-box">💡 <b>Tips:</b> Mô tả dự án, vai trò của bạn, công nghệ sử dụng và kết quả.</div>
                            <RichTextEditor value={formData.description} onChange={handleRichTextChange} placeholder="- Vai trò: ...&#10;- Công nghệ: ..." />
                        </div>
                    </div>
                );

            case 'educations':
                return (
                    <div className="form-layout-stacked">
                        <div className="form-group">
                            <label>Trường <span className="red">*</span></label>
                            <input type="text" name="school" value={formData.school || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Ngành học</label>
                                <input type="text" name="major" value={formData.major || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group half">
                                <label>Trình độ</label>
                                <select name="degree" value={formData.degree || ''} onChange={handleInputChange}>
                                    <option value="">Chọn trình độ</option>
                                    <option value="Đại học">Đại học</option>
                                    <option value="Cao đẳng">Cao đẳng</option>
                                </select>
                            </div>
                        </div>
                         <div className="form-row date-row">
                            <div className="date-group">
                                <label>Từ tháng</label>
                                <div className="date-selects">
                                    <select name="startMonth" value={formData.startMonth || ''} onChange={handleInputChange}><option>Tháng</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                                    <select name="startYear" value={formData.startYear || ''} onChange={handleInputChange}><option>Năm</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                                </div>
                            </div>
                            <div className="date-group">
                                <label>Đến tháng</label>
                                <div className="date-selects">
                                    <select name="endMonth" value={formData.endMonth || ''} onChange={handleInputChange}><option>Tháng</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                                    <select name="endYear" value={formData.endYear || ''} onChange={handleInputChange}><option>Năm</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Mô tả thêm</label>
                            <textarea className="input-textarea" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="GPA, Thành tích..." />
                        </div>
                    </div>
                );
            
             case 'introduction':
             case 'strengths':
                return (
                    <div className="form-layout-stacked">
                        <div className="tip-box">
                             💡 <b>Tips:</b> {activeSection === 'strengths' ? 'Liệt kê điểm mạnh.' : 'Giới thiệu ngắn gọn.'}
                        </div>
                        <RichTextEditor value={formData.content} onChange={handleRichTextChange} />
                    </div>
                );

            case 'certificates':
            case 'awards':
                return (
                    <div className="form-layout-stacked">
                         <div className="form-group">
                            <label>Tên {activeSection === 'certificates' ? 'chứng chỉ' : 'giải thưởng'}</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Tổ chức / Thời gian</label>
                            <input type="text" name="organization" value={formData.organization || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    // --- HELPER: DANH SÁCH ITEM HIỂN THỊ CHI TIẾT ---
    const SectionList = ({ items, sectionKey }) => {
        if (!items || items.length === 0) return null;

        const formatDate = (item) => {
            const start = item.startYear ? `${item.startMonth ? item.startMonth + '/' : ''}${item.startYear}` : '';
            const end = item.isCurrent ? 'HIỆN TẠI' : (item.endYear ? `${item.endMonth ? item.endMonth + '/' : ''}${item.endYear}` : '');
            return start || end ? `${start}${start && end ? ' - ' : ''}${end}` : '';
        };

        const getSubtitle = (item) => {
            const parts = [];
            if (item.company) parts.push(item.company);
            if (item.organization) parts.push(item.organization);
            if (item.degree) parts.push(item.degree);
            if (item.major) parts.push(item.major);
            return parts.join(' - ');
        };

        return (
            <div className="section-detailed-list">
                {items.map((item, idx) => (
                    <div key={idx} className="detailed-item">
                        <div className="item-header">
                            <h4 className="item-title">
                                {item.name || item.title || item.school || 'Tiêu đề trống'}
                            </h4>
                            <div className="item-actions">
                                <button className="btn-icon edit" onClick={() => handleOpenModal(sectionKey, idx)} title="Sửa">✎</button>
                                <button className="btn-icon delete" onClick={() => handleDeleteItem(sectionKey, idx)} title="Xóa">🗑</button>
                            </div>
                        </div>

                        {getSubtitle(item) && (
                            <div className="item-subtitle">{getSubtitle(item)}</div>
                        )}

                        <div className="item-date">
                            {formatDate(item)}
                        </div>

                        {item.description && (
                            <div className="item-description-block">
                                {sectionKey === 'projects' && <strong>Dự án:</strong>}
                                <div 
                                    className="rich-text-view"
                                    dangerouslySetInnerHTML={{ __html: item.description }} 
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const SectionCard = ({ title, description, icon, sectionKey }) => {
        const renderStaticContent = () => {
            if (sectionKey === 'skills') {
                const { hardSkills, softSkills } = cvData.skills;
                if (!hardSkills && !softSkills) return null;
                return (
                    <div className="static-content-view">
                        {hardSkills && <div className="skill-row"><strong>Chuyên môn:</strong> {hardSkills}</div>}
                        {softSkills && <div className="skill-row"><strong>Kỹ năng mềm:</strong> {softSkills}</div>}
                    </div>
                );
            }
            if (['introduction', 'strengths'].includes(sectionKey)) {
                const content = cvData[sectionKey];
                if (!content) return null;
                return (
                    <div className="static-content-view rich-text-view" dangerouslySetInnerHTML={{ __html: content }} />
                );
            }
            return null;
        };

        return (
            <div className="cv-section-card">
                <div className="cv-section-info">
                    <div className="cv-section-icon">{icon}</div>
                    <div className="cv-section-text">
                        <h3>{title}</h3>
                        
                        {Array.isArray(cvData[sectionKey]) && (
                            <>
                                {cvData[sectionKey].length === 0 && <p>{description}</p>}
                                <SectionList items={cvData[sectionKey]} sectionKey={sectionKey} />
                            </>
                        )}

                        {!Array.isArray(cvData[sectionKey]) && (
                            <>
                                {!renderStaticContent() && <p>{description}</p>}
                                {renderStaticContent()}
                            </>
                        )}
                    </div>
                </div>
                <button className="btn-add-section" onClick={() => handleOpenModal(sectionKey, null)}>+</button>
            </div>
        );
    };

    return (
        <div className="cv-builder-page">
            <div className="cv-builder-container">
                <div className="cv-main-content">
                    {/* HEADER */}
                    <div className="cv-header-card">
                        {cvData.personalInfo.avatar ? (
                            <img src={cvData.personalInfo.avatar} alt="Avatar" style={{width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd'}} />
                        ) : (
                            <div className="user-avatar-placeholder">{cvData.personalInfo.fullName.charAt(0)}</div>
                        )}
                        <div className="user-basic-info">
                            <h2>{cvData.personalInfo.fullName}</h2>
                            <p>{cvData.personalInfo.title}</p>
                            <div className="contact-grid">
                                <span>📧 {cvData.personalInfo.email}</span>
                                <span>📞 {cvData.personalInfo.phone}</span>
                            </div>
                        </div>
                        <button className="btn-edit-header" onClick={() => handleOpenModal('personalInfo')}>✏️</button>
                    </div>

                    {/* GRID SECTIONS */}
                    <div className="cv-sections-grid">
                        <SectionCard title="Giới thiệu bản thân" description="Mục tiêu nghề nghiệp" icon="👤" sectionKey="introduction" />
                        <SectionCard title="Kinh nghiệm làm việc" description="Quá trình làm việc" icon="💼" sectionKey="experiences" />
                        <SectionCard title="Dự án cá nhân" description="Dự án đã tham gia" icon="🚀" sectionKey="projects" />
                        <SectionCard title="Học vấn" description="Trình độ học vấn" icon="🎓" sectionKey="educations" />
                        <SectionCard title="Kỹ năng" description="Chuyên môn & kỹ năng mềm" icon="⚡" sectionKey="skills" />
                        <SectionCard title="Chứng chỉ" description="Chứng chỉ đạt được" icon="📜" sectionKey="certificates" />
                        <SectionCard title="Giải thưởng" description="Thành tích nổi bật" icon="🏆" sectionKey="awards" />
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="cv-sidebar">
                    <div className="completion-card">
                        <h3>Độ hoàn thiện</h3>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${completionPercent}%` }}></div>
                        </div>
                        <div className="progress-text">{completionPercent}%</div>
                        <button className="btn-view-cv" onClick={() => navigate('/preview', { state: { cvData } })}>Xem CV</button>
                        <div style={{marginTop: 10, textAlign: 'center'}}>
                            <button onClick={handleResetData} style={{color: '#888', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: 12}}>
                                ⚠ Xóa dữ liệu & Làm mới
                            </button>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content large-modal">
                            <div className="modal-header">
                                <h3>{editIndex !== null ? 'Cập nhật thông tin' : 'Thêm mới thông tin'}</h3>
                                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {renderModalContent()}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button className="btn-save" onClick={handleSave}>Lưu thông tin</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVBuilder;