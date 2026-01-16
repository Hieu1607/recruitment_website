import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import { getMyCompany } from '../../services/profileService';
import '../../css/postJob.css';

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);

    // State chứa dữ liệu form
    const [jobData, setJobData] = useState({
        title: '',
        salary: '',
        location: '',
        level: 'Junior',
        deadline: '',
        description: '',
        requirements: '',
        benefits: ''
    });

    // 1. Kiểm tra xem User đã có công ty chưa khi vào trang
    useEffect(() => {
        const checkCompany = async () => {
            try {
                const company = await getMyCompany();
                if (company && company.id) {
                    setCompanyId(company.id);
                    // Tự động điền location của công ty vào form nếu muốn tiện
                    if(company.address) {
                        setJobData(prev => ({...prev, location: company.address.split(',').pop().trim()}));
                    }
                } else {
                    alert("Bạn cần tạo Hồ sơ công ty trước khi đăng tin tuyển dụng!");
                    navigate('/employer/company-profile');
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin công ty:", error);
            }
        };
        checkCompany();
    }, [navigate]);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setJobData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!companyId) {
            alert("Không tìm thấy thông tin công ty. Vui lòng tải lại trang.");
            return;
        }

        setLoading(true);

        try {
            // Chuẩn bị payload đúng chuẩn API yêu cầu
            const payload = {
                company_id: companyId, // BẮT BUỘC
                title: jobData.title,
                level: jobData.level,
                salary: jobData.salary,
                location: jobData.location,
                deadline: jobData.deadline, // YYYY-MM-DD
                description: jobData.description,
                requirements: jobData.requirements,
                benefits: jobData.benefits
            };

            console.log("Submitting Job:", payload); // Debug

            await jobService.createJob(payload);
            
            alert("🎉 Đăng tin tuyển dụng thành công!");
            navigate('/employer/jobs'); // Chuyển hướng về trang quản lý tin (nếu có) hoặc về Home
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.errors 
                ? error.response.data.errors.map(e => e.message).join('\n')
                : (error.response?.data?.message || "Có lỗi xảy ra");
            alert("Lỗi:\n" + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!companyId) return <div style={{textAlign:'center', marginTop:'100px'}}>Đang kiểm tra thông tin công ty...</div>;

    return (
        <div className="post-job-page">
            <div className="post-job-container">
                <div className="post-card">
                    <h2 className="section-title">✨ Đăng tin tuyển dụng mới</h2>
                    
                    <form onSubmit={handleSubmit}>
                        {/* 1. Tiêu đề */}
                        <div className="form-group">
                            <label className="form-label">Chức danh tuyển dụng (Title) <span className="req">*</span></label>
                            <input 
                                type="text" 
                                name="title"
                                className="custom-input" 
                                placeholder="Ví dụ: Frontend Developer (ReactJS)"
                                value={jobData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* 2. Lương & Địa điểm */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Mức lương <span className="req">*</span></label>
                                <input 
                                    type="text" 
                                    name="salary"
                                    className="custom-input" 
                                    placeholder="Ví dụ: 1000-1500 USD"
                                    value={jobData.salary}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Địa điểm làm việc <span className="req">*</span></label>
                                <input 
                                    type="text" 
                                    name="location"
                                    className="custom-input" 
                                    placeholder="Ví dụ: Hanoi"
                                    value={jobData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* 3. Cấp bậc, Hạn nộp */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Cấp bậc (Level)</label>
                                <select 
                                    name="level" 
                                    className="custom-select"
                                    value={jobData.level}
                                    onChange={handleChange}
                                >
                                    <option value="Intern">Intern</option>
                                    <option value="Fresher">Fresher</option>
                                    <option value="Junior">Junior</option>
                                    <option value="Mid">Mid</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hạn nộp hồ sơ <span className="req">*</span></label>
                                <input 
                                    type="date" 
                                    name="deadline"
                                    className="custom-input" 
                                    value={jobData.deadline}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* 4. Mô tả công việc */}
                        <div className="form-group">
                            <label className="form-label">Mô tả công việc (Description) <span className="req">*</span></label>
                            <textarea 
                                name="description"
                                className="custom-textarea"
                                placeholder="- Xây dựng giao diện người dùng..."
                                value={jobData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        {/* 5. Yêu cầu ứng viên */}
                        <div className="form-group">
                            <label className="form-label">Yêu cầu ứng viên (Requirements)</label>
                            <textarea 
                                name="requirements"
                                className="custom-textarea"
                                placeholder="- Thành thạo ReactJS, HTML, CSS..."
                                value={jobData.requirements}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* 6. Quyền lợi */}
                        <div className="form-group">
                            <label className="form-label">Quyền lợi (Benefits)</label>
                            <textarea 
                                name="benefits"
                                className="custom-textarea"
                                placeholder="- Bảo hiểm y tế, thưởng hàng năm..."
                                value={jobData.benefits}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit-job" disabled={loading}>
                            {loading ? 'Đang xử lý...' : '🚀 Đăng tin ngay'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;