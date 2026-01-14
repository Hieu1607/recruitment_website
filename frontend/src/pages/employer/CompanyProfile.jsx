import React, { useEffect, useState } from 'react';
import {
    getMyCompany,
    createCompanyProfile,
    updateCompanyProfile
} from '../../services/profileService';
import '../../css/companyProfile.css';

const CompanyProfile = () => {
    const [company, setCompany] = useState({
        name: '',
        website: '',
        size: '1-10',
        type: '',
        address: '',
        phone: '',
        description: ''
    });

    const [companyId, setCompanyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(
        'https://via.placeholder.com/150?text=LOGO'
    );

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const data = await getMyCompany();
            if (data) {
                setCompany({
                    name: data.name || '',
                    website: data.website || '',
                    size: data.size || '1-10',
                    type: data.type || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    description: data.description || ''
                });
                setCompanyId(data.id);
                if (data.logo_company_url) {
                    setLogoPreview(data.logo_company_url);
                }
            }
        } catch (err) {
            console.log('Chưa có công ty');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            formData.append('name', company.name);
            formData.append('website', company.website);
            formData.append('size', company.size);
            formData.append('type', company.type);
            formData.append('address', company.address);
            formData.append('phone', company.phone);
            formData.append('description', company.description);

            if (logoFile) {
                formData.append('logo_company_url', logoFile);
            }

            if (companyId) {
                await updateCompanyProfile(companyId, formData);
                alert('Cập nhật hồ sơ công ty thành công!');
            } else {
                const newCompany = await createCompanyProfile(formData);
                setCompanyId(newCompany.id);
                alert('Tạo hồ sơ công ty thành công!');
            }
        } catch (err) {
            alert('Lỗi lưu hồ sơ công ty');
        }
    };

    if (loading) {
        return (
            <div style={{ marginTop: '100px', textAlign: 'center' }}>
                Đang tải...
            </div>
        );
    }

    return (
        <div className="profile-company-page">
            <div className="profile-company-container">
                <div className="profile-company-card">

                    {/* SIDEBAR */}
                    <div className="profile-company-sidebar">
                        <div className="profile-company-avatar-wrapper">
                            <img
                                src={logoPreview}
                                alt="Logo công ty"
                                className="profile-company-avatar"
                            />
                            <label className="profile-company-upload-label">
                                <div className="profile-company-upload-overlay">
                                    <span>📷</span>
                                </div>
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                            </label>
                        </div>

                        <h3 className="profile-company-name">
                            {company.name || 'Tên công ty'}
                        </h3>

                        {company.website ? (
                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-company-website"
                            >
                                🌐 {company.website}
                            </a>
                        ) : (
                            <span className="profile-company-website empty">
                                🌐 Chưa cập nhật website
                            </span>
                        )}

                        <div className="profile-company-info-list">
                            <div className="profile-company-info-item">
                                <span>📞</span>
                                <span>{company.phone || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="profile-company-info-item">
                                <span>📍</span>
                                <span>{company.address || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="profile-company-info-item">
                                <span>🏢</span>
                                <span>{company.type || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="profile-company-info-item">
                                <span>👥</span>
                                <span>{company.size} nhân viên</span>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="profile-company-content">
                        <h2 className="profile-company-title">
                            HỒ SƠ CÔNG TY
                        </h2>

                        <form onSubmit={handleSave}>
                            <div className="profile-company-form-group">
                                <label>Tên công ty *</label>
                                <input
                                    className="profile-company-input"
                                    required
                                    value={company.name}
                                    onChange={(e) =>
                                        setCompany({
                                            ...company,
                                            name: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="profile-company-form-grid">
                                <div className="profile-company-form-group">
                                    <label>Website</label>
                                    <input
                                        className="profile-company-input"
                                        value={company.website}
                                        onChange={(e) =>
                                            setCompany({
                                                ...company,
                                                website: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="profile-company-form-group">
                                    <label>Loại hình</label>
                                    <input
                                        className="profile-company-input"
                                        value={company.type}
                                        onChange={(e) =>
                                            setCompany({
                                                ...company,
                                                type: e.target.value
                                        })
                                    }
                                    />
                                </div>
                            </div>

                            <div className="profile-company-form-grid">
                                <div className="profile-company-form-group">
                                    <label>Quy mô nhân sự</label>
                                    <select
                                        className="profile-company-select"
                                        value={company.size}
                                        onChange={(e) =>
                                            setCompany({
                                                ...company,
                                                size: e.target.value
                                            })
                                        }
                                    >
                                        <option value="1-10">1-10 nhân viên</option>
                                        <option value="11-50">11-50 nhân viên</option>
                                        <option value="51-200">51-200 nhân viên</option>
                                        <option value="201-500">201-500 nhân viên</option>
                                        <option value="5000+">5000+ nhân viên</option>
                                    </select>
                                </div>

                                <div className="profile-company-form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        className="profile-company-input"
                                        value={company.phone}
                                        onChange={(e) =>
                                            setCompany({
                                                ...company,
                                                phone: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="profile-company-form-group">
                                <label>Giới thiệu công ty</label>
                                <textarea
                                    className="profile-company-textarea"
                                    rows="6"
                                    value={company.description}
                                    onChange={(e) =>
                                        setCompany({
                                            ...company,
                                            description: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="profile-company-btn-save"
                            >
                                💾 Lưu thay đổi
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
